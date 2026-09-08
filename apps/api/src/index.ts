import express from 'express';

import { healthRouter } from './routes/health.routes.js';
import { usersRouter } from './routes/users.routes.js';

const app = express();
app.use(express.json());
app.use(healthRouter);
app.use('/users', usersRouter);

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`API is running on http://localhost:${port}`);
});
