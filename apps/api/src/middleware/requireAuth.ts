import type { RequestHandler } from 'express';

import { verifyAccessToken } from '../lib/jwt.js';

export const requireAuth: RequestHandler = async (req, res, next) => {
  const token: unknown = req.cookies?.accessToken;

  if (typeof token !== 'string' || token.length === 0) {
    res.status(401).json({ message: 'Не авторизован' });
    return;
  }

  try {
    req.userId = await verifyAccessToken(token);
  } catch {
    res.status(401).json({ message: 'Не авторизован' });
    return;
  }

  next();
};
