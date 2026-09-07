import { Router } from 'express';

import { prisma } from '../lib/prisma.js';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

healthRouter.get('/db-health', async (_req, res) => {
  const usersCount = await prisma.user.count();

  res.status(200).json({
    status: 'ok',
    database: 'connected',
    usersCount,
  });
});

healthRouter.get('/hello', (req, res) => {
  const name = req.query.name;

  if (name) {
    res.status(200).json({ message: `Hello ${name} from Volex API` });
  } else {
    res.status(200).json({ message: `Hello World from Volex API` });
  }
});
