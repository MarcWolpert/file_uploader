import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { prisma } from '../model/prismaInit.js';

passport.use(
	new LocalStrategy(async (username: string, password: string, done) => {
		try {
			const user = await prisma.user.findFirst({
				where: {
					username: username,
				},
			});
			if (!user) {
				return done(null, false, { message: 'Incorrect username' });
			}
			const match = await bcrypt.compare(password, user.password);
			if (!match) {
				return done(null, false, { message: 'Incorrect password' });
			}
			return done(null, user);
		} catch (err) {
			return done(err);
		}
	}),
);

passport.serializeUser((user: any, done) => {
	done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
	try {
		const user = await prisma.user.findFirst({
			where: {
				id: id,
			},
		});
		done(null, user);
	} catch (err) {
		done(err);
	}
});

export const passport_init = passport;
