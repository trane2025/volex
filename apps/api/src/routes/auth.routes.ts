import { compare } from 'bcryptjs';
import { Router, type Request } from 'express';

import { prisma } from '../lib/prisma.js';
import { createAccessToken } from '../lib/jwt.js';
import {
  ACCESS_TOKEN_MAX_AGE,
  accessTokenCookieOptions,
  clearAuthCookies,
  refreshTokenCookieOptions,
} from '../lib/authCookie.js';
import {
  createRefreshSession,
  readRefreshToken,
  revokeRefreshSession,
  rotateRefreshSession,
} from '../lib/refreshSession.js';
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

authRouter.post('/refresh', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const token = readRefreshToken(req.cookies?.refreshToken);
  const session = token ? await rotateRefreshSession(token) : null;

  if (!session) {
    clearAuthCookies(res);
    res.status(401).json({ message: 'Сессия завершена. Войдите снова' });
    return;
  }

  const accessToken = await createAccessToken(session.userId);
  res.cookie('accessToken', accessToken, {
    ...accessTokenCookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  res.cookie('refreshToken', session.token, {
    ...refreshTokenCookieOptions,
    maxAge: Math.max(0, session.expiresAt.getTime() - Date.now()),
  });
  res.sendStatus(204);
});

authRouter.post('/logout', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const token = readRefreshToken(req.cookies?.refreshToken);
  if (token) await revokeRefreshSession(token);
  clearAuthCookies(res);
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
  const session = await createRefreshSession(user.id, readRefreshToken(req.cookies?.refreshToken));

  res.setHeader('Cache-Control', 'no-store');
  res.cookie('accessToken', accessToken, {
    ...accessTokenCookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  res.cookie('refreshToken', session.token, {
    ...refreshTokenCookieOptions,
    maxAge: Math.max(0, session.expiresAt.getTime() - Date.now()),
  });

  res.status(200).json({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});
