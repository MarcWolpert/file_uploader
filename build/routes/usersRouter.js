var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from 'express';
import { passport_init as passport } from '../authentication/auth.js';
import bcrypt from 'bcryptjs';
import { prisma } from '../model/prismaInit.js';
export const usersRouter = Router();
//routing
usersRouter.get('/sign-up', (req, res) => {
    res.render('sign-up', { title: 'Sign Up' });
});
//add users to our database
usersRouter.post('/sign-up', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //need to encrypt these
    try {
        const hashedPassword = yield bcrypt.hash(req.body.password, 10);
        yield prisma.user.create({
            data: {
                username: req.body.username,
                password: hashedPassword,
            },
        });
        res.redirect('/');
    }
    catch (err) {
        return next(err);
    }
}));
usersRouter.post('/log-in', passport.authenticate('local', {
    successRedirect: '/:username/files',
    failureRedirect: '/',
}));
usersRouter.get('/log-out', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});
usersRouter.get('/:username/files', (req, res) => {
    res.render('userFiles', { title: 'Your Files' });
});
//in http get requests dont have a body
usersRouter.get('/', (req, res) => {
    res.render('index', { title: 'Homepage', user: req.user });
});
//# sourceMappingURL=usersRouter.js.map