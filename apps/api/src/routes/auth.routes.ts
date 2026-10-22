import { compare } from 'bcryptjs';
import { Router, type Request } from 'express';

import { prisma } from '../lib/prisma.js';
import { createAccessToken } from '../lib/jwt.js';
import { accessTokenCookieOptions } from '../lib/authCookie.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const authRouter = Router();

type LoginBody = {
  email: unknown;
  password: unknown;
};

type LoginRequest = Request<Record<string, never>, unknown, LoginBody>;

authRouter.get('/me', requireAuth, async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: 'Не авторизован' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    res.status(401).json({ message: 'Не авторизован' });
    return;
  }

  res.status(200).json(user);
});

authRouter.patch('/me', requireAuth, async (req, res) => {
  const { name } = req.body ?? {};

  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: 'Не авторизован' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    res.status(401).json({ message: 'Не авторизован' });
    return;
  }

  if (typeof name !== 'string') {
    res.status(400).json({ message: 'Имя должно быть строкой' });
    return;
  }

  const trimmedName = name.trim();

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: trimmedName === '' ? null : trimmedName,
    },
  });

  res.status(200).json(updatedUser);
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie('accessToken', accessTokenCookieOptions);
  res.sendStatus(204);
});

authRouter.post('/login', async (req: LoginRequest, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || email.trim().length === 0 || typeof password !== 'string') {
    res.status(400).json({ message: 'Email и пароль обязательны' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email.trim(),
    },
    omit: {
      passwordHash: false,
    },
  });

  if (!user?.passwordHash) {
    res.status(401).json({ message: 'Неверный email или пароль' });
    return;
  }

  const isPasswordValid = await compare(password, user.passwordHash);

  if (!isPasswordValid) {
    res.status(401).json({ message: 'Неверный email или пароль' });
    return;
  }

  const accessToken = await createAccessToken(user.id);

  res.cookie('accessToken', accessToken, { ...accessTokenCookieOptions, maxAge: 20 * 60 * 1000 });

  res.status(200).json({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});
