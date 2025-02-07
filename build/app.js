// app.js
import path from 'path';
import express from 'express';
import session from 'express-session';
import 'dotenv/config';
import { passport_init as passport } from './authentication/auth.js';
import { usersRouter } from './routes/usersRouter.js';
//setup middleware
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(import.meta.dirname, '../src/views'));
//here we will use a session secret for security
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(process.cwd(), 'src/public/')));
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});
app.use('/', usersRouter);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Express auth app listening on port ${PORT}!`));
//# sourceMappingURL=app.js.map