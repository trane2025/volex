import { compare } from 'bcryptjs';
import { Router, type Request } from 'express';

import { prisma } from '../lib/prisma.js';

export const authRouter = Router();

type LoginBody = {
  email: unknown;
  password: unknown;
};

type LoginRequest = Request<Record<string, never>, unknown, LoginBody>;

authRouter.get('/me', async (req, res) => {
  const userId = req.session.userId;

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

authRouter.post('/logout', (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      res.status(500).json({
        message: 'Не удалось выйти из системы',
      });
      return;
    }

    res.sendStatus(204);
  });
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
  req.session.userId = user.id;

  res.status(200).json({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});
