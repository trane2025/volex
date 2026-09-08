import { Router, type Request } from 'express';

import { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';

export const usersRouter = Router();

type CreateUserBody = {
  email?: unknown;
  name?: unknown;
};

type CreateUserRequest = Request<Record<string, never>, unknown, CreateUserBody>;

usersRouter.post('/', async (req: CreateUserRequest, res) => {
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

usersRouter.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.status(200).json(users);
});

usersRouter.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ message: 'Id должен быть числом' });
    return;
  }

  const { email, name } = req.body ?? {};
  const updateData: { email?: string; name?: string } = {};

  if (email !== undefined) {
    if (typeof email !== 'string') {
      res.status(400).json({ message: 'Email должен быть строкой' });
      return;
    }

    updateData.email = email.trim();
  }

  if (name !== undefined) {
    if (typeof name !== 'string') {
      res.status(400).json({ message: 'Name должен быть строкой' });
      return;
    }

    updateData.name = name.trim();
  }

  if (Object.keys(updateData).length === 0) {
    res.status(400).json({ message: 'Нужно передать email или name' });
    return;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ message: 'Пользователь с таким email уже существует' });
      return;
    }

    console.error(error);
    res.status(500).json({ message: 'Не удалось обновить пользователя' });
  }
});

usersRouter.get('/:id', async (req, res) => {
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

usersRouter.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ message: 'Id должен быть числом' });
    return;
  }

  try {
    const deletedUser = await prisma.user.delete({
      where: { id },
    });

    res.status(200).json(deletedUser);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    console.error(error);
    res.status(500).json({ message: 'Не удалось удалить пользователя' });
  }
});
