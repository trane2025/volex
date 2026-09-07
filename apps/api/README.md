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
{"status":"ok"}
```

### Как проверить сборку

```bash
cd /Users/aleksejveselov/dev/volex/apps/api
npm run build
```

Если команда завершается без ошибок, TypeScript-проект собирается корректно.
