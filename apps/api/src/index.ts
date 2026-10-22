import express from 'express';
import 'dotenv/config';

import { healthRouter } from './routes/health.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(healthRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

const httpServer = createServer(app);
const io = new Server(httpServer);

io.on('connection', (socket) => {
  console.log('Socket connection connected', socket.id);

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected', socket.id);
  });
});

const port = Number(process.env.PORT || 4000);

httpServer.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
