import { Router } from 'express';
import { passport_init as passport } from '../authentication/auth.js';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../model/prismaInit.js';

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
		res.redirect('/');
	});
	//clears session on server
	req.session.destroy((err) => {
		if (err) return next(err);
		//clears cookie on client
		res.clearCookie('connect.sid');
		res.redirect('/');
	});
});

//pass in authentication middleware
usersRouter.get('/:user/files', (req: Request, res: Response, next) => {
	const username = req.params.user;
	res.render('userFiles', { title: `${username}'s Files` });
});

//in http get requests dont have a body
usersRouter.get('/', (req: Request, res: Response) => {
	res.render('index', {
		title: 'Homepage',
		user: req.user ? req.user?.username : null,
	});
});
