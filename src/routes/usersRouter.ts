import { Router } from 'express';
import { passport_init as passport } from '../authentication/auth.js';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../model/prismaInit.js';
import multer from 'multer';
import { get } from 'http';

//to upload files to a specific directory
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const usersRouter = Router();

function getAuthentication(req: Request, res: Response, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

//routing
usersRouter.get('/sign-up', (req: Request, res: Response) => {
	res.render('sign-up', { title: 'Sign Up' });
});

//add users to our database
usersRouter.post('/sign-up', async (req: Request, res: Response, next) => {
	//need to encrypt these
	try {
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		await prisma.user.create({
			data: {
				username: req.body.username,
				password: hashedPassword,
			},
		});
		res.redirect('/');
	} catch (err) {
		return next(err);
	}
});
usersRouter.post('/log-in', (req, res, next) => {
	passport.authenticate('local', (err, user, info) => {
		if (err) return next(err);
		if (!user) return res.redirect('/'); // handle failure appropriately
		req.logIn(user, (err) => {
			// establish session if needed
			if (err) return next(err);
			return res.redirect(`/${user.username}/files`);
		});
	})(req, res, next);
});

usersRouter.get('/log-out', (req, res, next) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
		//clears session on server
		req.session.destroy((err) => {
			if (err) return next(err);
			//clears cookie on client
			res.clearCookie('connect.sid');
			res.redirect('/');
		});
	});
});

// POST /upload-files endpoint
usersRouter.post(
	'/upload-files',
	getAuthentication,
	upload.single('filebytes'),
	async (req: Request, res: Response): Promise<any> => {
		try {
			// Ensure a file was sent
			if (!req.file) {
				return res.status(400).json({ error: 'No file provided' });
			}

			// Extract file details: multer provides `buffer`, `originalname`, and `size`
			const fileBuffer = req.file.buffer;
			const originalName = req.file.originalname;
			const fileSize = req.file.size; // Expecting a number
			console.log(fileSize);
			console.log(req.body);
			const { filepath } = req.body;

			// Validate required fields: userId, path, etc.
			if (!req.user || !filepath) {
				return res
					.status(400)
					.json({ error: 'Missing userId or file path' });
			}

			const currentUser = req.user as { id: number; username: string };
			const userId = await prisma.user.findFirst({
				where: {
					username: String(currentUser.id),
				},
			});

			const newFile = await prisma.files.create({
				data: {
					userId: Number(userId),
					file: fileBuffer,
					path: filepath,
					name: originalName,
					size: fileSize,
					// uploadTime defaults to now()
				},
			});

			// Return the created file record or a success message.
			res.status(200).json(newFile);
		} catch (error) {
			console.error('Upload error:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
);

//pass in authentication middleware
usersRouter.get(
	'/:user/files',
	(req: Request, res: Response, next: NextFunction) => {
		if (
			!req.isAuthenticated() ||
			(req.user as any).username !== req.params.user
		) {
			return res
				.status(403)
				.send('Forbidden: You can only access your own profile.');
		}
		const username = req.params.user;

		res.render('userFiles', { title: `${username}'s Files` });
	},
);

//in http get requests dont have a body
usersRouter.get('/', (req: Request, res: Response) => {
	if (req.user) {
		res.redirect(`/${req.user.username}/files`);
	}
	res.render('index', {
		title: 'Homepage',
	});
});
