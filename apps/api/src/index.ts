import express from 'express';
import 'dotenv/config';

import { healthRouter } from './routes/health.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { createServer, type IncomingMessage } from 'node:http';
import { verifyAccessToken } from './lib/jwt.js';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';

type SocketRequest = IncomingMessage & {
  cookies?: Record<string, unknown>;
};

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(healthRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

const httpServer = createServer(app);
const io = new Server(httpServer);
io.engine.use(cookieParser());

const unauthorizedSocketError = () => {
  const error = new Error('Не авторизован') as Error & { data: { code: string } };
  error.data = { code: 'UNAUTHORIZED' };
  return error;
};

io.use(async (socket, next) => {
  const request = socket.request as SocketRequest;
  const token = request.cookies?.accessToken;

  if (typeof token !== 'string' || token.length === 0) {
    next(unauthorizedSocketError());
    return;
  }

  try {
    socket.data.userId = await verifyAccessToken(token);
  } catch {
    next(unauthorizedSocketError());
    return;
  }

  next();
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id, 'userId:', socket.data.userId);

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', socket.id, 'reason:', reason);
  });
});

const port = Number(process.env.PORT || 4000);

httpServer.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
