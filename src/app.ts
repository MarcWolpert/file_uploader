// app.js
import path from 'path';
import { Pool } from 'pg';
import express, { Request, Response } from 'express';
import session from 'express-session';
import 'dotenv/config';
import { prisma } from './model/prismaInit.js';
import { passport_init as passport } from './authentication/auth.js';
import bcrypt from 'bcryptjs';
import { usersRouter } from './routes/usersRouter.js';
import morgan from 'morgan';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';

//setup middleware
const app = express();
app.use(morgan('combined'));
app.set('view engine', 'ejs');
app.set('views', path.join(import.meta.dirname, '../src/views'));

app.use(express.urlencoded({ extended: false }));
//add file/files object to the request object

app.use(
	express.static(path.join(process.cwd(), 'src/public/'), {
		setHeaders: function (res, path) {
			if (path.endsWith('.css')) {
				res.set('Content-Type', 'text/css');
			}
		},
	}),
);

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	next();
});

//here we will use a session secret for security
app.use(
	session({
		cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		store: new PrismaSessionStore(new PrismaClient(), {
			checkPeriod: 2 * 60 * 1000,
			dbRecordIdIsSessionId: true,
			dbRecordIdFunction: undefined,
		}),
	}),
);
app.use(passport.session());
app.use('/', usersRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
	console.log(`Express auth app listening on port ${PORT}!`),
);
