# Volex API

Backend-приложение Volex находится в `apps/api`.

## Урок 1: Express + TypeScript + GET /health

Цель первого маленького шага: поднять отдельный Node.js backend на Express и проверить, что сервер отвечает на `GET /health`.

Пока намеренно не добавляем базу данных, авторизацию и WebSocket.

### Что сделали

1. Создали папку backend-приложения:

```bash
mkdir -p apps/api/src
```

2. Инициализировали npm-пакет:

```bash
cd /Users/aleksejveselov/dev/volex/apps/api
npm init -y
```

3. Установили Express:

```bash
npm install express
```

4. Установили инструменты для TypeScript:

```bash
npm install -D typescript tsx @types/node @types/express
```

5. Добавили scripts в `package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### Зачем это нужно

- `express` создает HTTP-сервер и маршруты.
- `typescript` дает типизацию.
- `tsx` запускает TypeScript-файлы в dev-режиме без ручной сборки.
- `@types/node` и `@types/express` добавляют типы для Node.js и Express.
- `GET /health` нужен как самый простой способ проверить, что API живо.

### Главные файлы

- `package.json` — зависимости и команды запуска.
- `package-lock.json` — зафиксированные версии npm-зависимостей.
- `tsconfig.json` — настройки TypeScript.
- `src/index.ts` — точка входа API и маршрут `GET /health`.
- `.gitignore` — исключает `node_modules`, `dist`, `.env` и локальные файлы.

### Как запустить

```bash
cd /Users/aleksejveselov/dev/volex/apps/api
npm run dev
```

Ожидаемый лог:

```text
API is running on http://localhost:4000
```

### Как проверить

В другом терминале:

```bash
curl http://localhost:4000/health
```

Ожидаемый ответ:

```json
{ "status": "ok" }
```

### Как проверить сборку

```bash
cd /Users/aleksejveselov/dev/volex/apps/api
npm run build
```

Если команда завершается без ошибок, TypeScript-проект собирается корректно.

## Урок 2: SQLite + Prisma

Цель второго маленького шага: добавить базу данных и Prisma ORM, создать первую таблицу `User` и проверить, что API умеет читать данные из базы.

Пока намеренно не добавляем регистрацию, логин, пароли, JWT, роли и WebSocket.

### Что выбрали

Для первого шага с базой используем SQLite.

SQLite — это база данных в одном локальном `.db`-файле. Она удобна для обучения и разработки, потому что не нужно отдельно устанавливать PostgreSQL или Docker.

Позже для деплоя можно будет перейти на PostgreSQL: идея Prisma останется той же, но изменятся `provider` и `DATABASE_URL`.

### Что установили

```bash
cd /Users/aleksejveselov/dev/volex/apps/api
npm install @prisma/client @prisma/adapter-better-sqlite3 dotenv
npm install -D prisma @types/better-sqlite3
```

Зачем:

- `prisma` — CLI для команд `init`, `migrate`, `generate`, `studio`.
- `@prisma/client` — библиотека, через которую код делает запросы к базе.
- `@prisma/adapter-better-sqlite3` — адаптер, который подключает Prisma Client к SQLite.
- `dotenv` — читает переменные окружения из `.env`.
- `@types/better-sqlite3` — TypeScript-типы для SQLite-адаптера.

### Что создали

Инициализировали Prisma:

```bash
npx prisma init --datasource-provider sqlite --output ../src/generated/prisma
```

Эта команда создала:

- `prisma/schema.prisma` — описание моделей базы.
- `prisma7.config.ts` — конфиг Prisma CLI.
- `.env` — локальные переменные окружения.

Также добавили `.env.example`, чтобы было видно, какая переменная нужна проекту:

```env
DATABASE_URL="file:./dev.db"
```

`.env` не коммитим, потому что там могут быть секреты. `.env.example` коммитим, потому что это пример.

### Что добавили в Prisma schema

Файл: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "sqlite"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Что это значит:

- `generator client` говорит Prisma, куда сгенерировать TypeScript-клиент.
- `datasource db` говорит, что база сейчас SQLite.
- `model User` описывает таблицу пользователей.
- `id` — первичный ключ.
- `email` — уникальный email.
- `name` — необязательное имя.
- `createdAt` — дата создания записи.
- `updatedAt` — дата последнего обновления записи.

### Как применить схему к базе

```bash
npm run db:migrate -- --name init
```

Этот script запускает:

```bash
RUST_LOG=info prisma migrate dev
```

`RUST_LOG=info` оставлен специально: на текущей версии Prisma/SQLite обычный `prisma migrate dev` на этой машине может падать с пустой ошибкой `Schema engine error:`.

После миграции появились:

- `dev.db` — локальный SQLite-файл, он игнорируется Git.
- `prisma/migrations/.../migration.sql` — SQL-история изменения схемы, ее коммитим.
- `prisma/migrations/migration_lock.toml` — служебный файл Prisma Migrate, его коммитим.

### Как сгенерировать Prisma Client

```bash
npm run db:generate
```

Prisma Client генерируется в:

```text
src/generated/prisma
```

Эта папка игнорируется Git, потому что ее можно пересоздать командой `npm run db:generate`.

### Как подключили Prisma в коде

Файл: `src/lib/prisma.ts`

```ts
import 'dotenv/config';

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

import { PrismaClient } from '../generated/prisma/client.js';

const databaseUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

export const prisma = new PrismaClient({ adapter });
```

Зачем:

- читаем `DATABASE_URL`;
- создаем SQLite-адаптер;
- создаем один общий `prisma` client;
- импортируем этот client в routes.

### Какие routes добавили

Файл: `src/index.ts`

`GET /db-health` проверяет, что API может сходить в базу:

```ts
app.get('/db-health', async (_req, res) => {
  const usersCount = await prisma.user.count();

  res.status(200).json({
    status: 'ok',
    database: 'connected',
    usersCount,
  });
});
```

`GET /users` возвращает список пользователей:

```ts
app.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.status(200).json(users);
});
```

Пока пользователей нет, поэтому ожидаемый ответ — пустой массив.

### Как проверить

Сначала сборка:

```bash
npm run build
```

Потом запуск:

```bash
npm run dev
```

Проверить подключение к базе:

```bash
curl http://localhost:4000/db-health
```

Ожидаемый ответ:

```json
{ "status": "ok", "database": "connected", "usersCount": 0 }
```

Проверить чтение таблицы `User`:

```bash
curl http://localhost:4000/users
```

Ожидаемый ответ:

```json
[]
```

### Полезные команды

```bash
npm run db:migrate -- --name init
npm run db:generate
npm run db:studio
npm run build
npm run dev
```

### Примечание по `npm audit`

На 2026-09-08 `npm audit --omit=dev` показывает 4 high severity warnings через транзитивные зависимости Prisma 7.10.0:

- `deepmerge-ts`
- `mysql2`

В проекте сейчас используется SQLite, а не MySQL. `npm audit fix --force` предлагает откатить Prisma до 6.19.3, то есть сделать breaking change. Поэтому автоматически этот fix не применяли.

Когда у Prisma выйдет патч выше `7.10.0`, стоит повторить:

```bash
npm view @prisma/client version
npm install @prisma/client@latest @prisma/adapter-better-sqlite3@latest
npm install -D prisma@latest
npm audit --omit=dev
```
