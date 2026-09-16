import { compare } from 'bcryptjs';
import { Router, type Request } from 'express';

import { prisma } from '../lib/prisma.js';

export const authRouter = Router();

type LoginBody = {
  email: unknown;
  password: unknown;
};

type LoginRequest = Request<Record<string, never>, unknown, LoginBody>;

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

  req.session.userId = user.id;

  if (!isPasswordValid) {
    res.status(401).json({ message: 'Неверный email или пароль' });
    return;
  }

  res.status(200).json({
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});
