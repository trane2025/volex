import type { RequestHandler } from 'express';

import { prisma } from '../lib/prisma.js';

export const requireAdmin: RequestHandler = async (req, res, next) => {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ message: 'Не авторизован' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    res.status(401).json({ message: 'Не авторизован' });
    return;
  }

  if (user.role !== 'ADMIN') {
    res.status(403).json({ message: 'Недостаточно прав' });
    return;
  }

  next();
};
