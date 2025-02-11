import { Router } from 'express';
import { passport_init as passport } from '../authentication/auth.js';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../model/prismaInit.js';
import multer, { memoryStorage } from 'multer';
import { get } from 'http';
declare global {
	namespace Express {
		interface Request {
			userFiles?: any;
		}
	}
}
interface UserFiles {
	id: number;
	name: string;
	userId: number;
	path: string;
	size: number;
	uploadTime: Date;
}

//to upload files to a specific directory
const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
});

export const usersRouter = Router();

const getFiles = async function (req, res, next) {
	const userName = req.params.user;
	const user = await prisma.user.findFirst({
		where: {
			username: userName,
		},
	});
	const userFiles = await prisma.files.findMany({
		where: { userId: user.id },
		omit: { file: true },
	});

	// Store the files in res.locals for use in later middleware and views
	req.userFiles = userFiles as UserFiles[];

	next();
};

function getAuthentication(req: Request, res: Response, next: NextFunction) {
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
usersRouter.post(
	'/sign-up',
	async (req: Request, res: Response, next: NextFunction) => {
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
	},
);
usersRouter.post(
	'/log-in',
	(req: Request, res: Response, next: NextFunction) => {
		passport.authenticate('local', (err, user, info) => {
			if (err) return next(err);
			if (!user) return res.redirect('/'); // handle failure appropriately
			req.logIn(user, (err) => {
				// establish session if needed
				if (err) return next(err);
				return res.redirect(`/${user.username}/files`);
			});
		})(req, res, next);
	},
);

usersRouter.get(
	'/log-out',
	(req: Request, res: Response, next: NextFunction) => {
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
	},
);

// POST /upload-files endpoint
usersRouter.post(
	'/upload-files',
	getAuthentication,
	upload.single('filebytes'),
	async (req: Request, res: Response): Promise<any> => {
		try {
			console.log(req.file, req.body);
			// Ensure a file was sent
			if (!req.file) {
				return res.status(400).json({ error: 'No file provided' });
			}

			// Extract file details: multer provides `buffer`, `originalname`, and `size`
			const fileBuffer = req.file.buffer;
			console.log(req.file.buffer);
			const originalName = req.file.originalname;
			const fileSize = req.file.size; // Expecting a number
			const filepath = req.body.filepath;

			// Validate required fields: userId, path, etc.
			if (!req.user || !filepath) {
				return res
					.status(400)
					.json({ error: 'Missing userId or file path' });
			}

			const { id } = req.user as {
				id: number;
				username: string;
				password: string;
			};
			console.log('Current User: ', id);
			//validating that the user exists in the db
			const userId = await prisma.user.findFirst({
				where: {
					username: String(id),
				},
			});

			console.log('User ID: ', userId);
			console.log(fileBuffer, filepath, originalName, fileSize);

			const newFile = await prisma.files.create({
				data: {
					userId: Number(id),
					file: fileBuffer,
					path: filepath,
					name: originalName,
					size: fileSize,
					// uploadTime defaults to now()
				},
			});

			// Return the created file record or a success message.
			res.status(200).redirect('/');
		} catch (error) {
			console.error('Upload error:', error);
			res.status(500).json({ error: 'Internal server error' });
		}
	},
);

//pass in authentication middleware
usersRouter.get(
	'/:user/files',
	getAuthentication,
	getFiles,
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
		console.log(req.userFiles);
		const revisedFiles = req.userFiles.map((item: UserFiles) => {
			const date = item.uploadTime.toDateString();
			console.log(date);
			return { ...item, uploadTime: date };
		});

		res.render('userFiles', {
			title: `${username}'s Files`,
			files: revisedFiles,
		});
	},
);

//in http get requests dont have a body
usersRouter.get('/', (req: Request, res: Response) => {
	if (req?.user) {
		res.redirect(`/${req.user.username}/files`);
	}
	res.render('index', {
		title: 'Homepage',
	});
});
