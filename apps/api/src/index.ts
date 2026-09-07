import express, { type Request } from 'express';

import { Prisma } from './generated/prisma/client.js';
import { prisma } from './lib/prisma.js';
import { healthRouter } from './routes/health.routes.js';

const app = express();
app.use(express.json());
app.use(healthRouter);

const port = Number(process.env.PORT ?? 4000);

type CreateUserBody = {
  email?: unknown;
  name?: unknown;
};

type CreateUserRequest = Request<Record<string, never>, unknown, CreateUserBody>;



app.post('/users', async (req: CreateUserRequest, res) => {
  const { email, name } = req.body ?? {};

  if (typeof email !== 'string' || email.trim().length === 0) {
    res.status(400).json({ message: 'Email обязателен' });
    return;
  }

  if (name !== undefined && name !== null && typeof name !== 'string') {
    res.status(400).json({ message: 'Name должен быть строкой' });
    return;
  }

  const trimmedName = typeof name === 'string' ? name.trim() : undefined;

  try {
    const user = await prisma.user.create({
      data: {
        email: email.trim(),
        ...(trimmedName ? { name: trimmedName } : {}),
      },
    });

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ message: 'Пользователь с таким email уже существует' });
      return;
    }

    console.error(error);
    res.status(500).json({ message: 'Не удалось создать пользователя' });
  }
});

app.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.status(200).json(users);
});

app.get('/users/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ message: 'Id должен быть числом' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    res.status(404).json({ message: 'Пользователь не найден' });
    return;
  }

  res.status(200).json(user);
});

app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
