import express from 'express';
import 'dotenv/config';

import { healthRouter } from './routes/health.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { authRouter } from './routes/auth.routes.js';
import session from 'express-session';

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error('SESSION_SECRET не задан');
}

const app = express();
app.use(express.json());
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(healthRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
