# Volex Lesson Progress

Last updated: 2026-09-08

## How To Resume

In a new chat, say:

```txt
Продолжаем урок Volex. Прочитай LESSON_PROGRESS.md и продолжи с раздела "Next Lesson".
```

The learning format should stay slow and practical:

- one small concept at a time;
- explain what the code means before adding more code;
- give a small task for the student to do by hand;
- check the result after the student changes files;
- avoid jumping ahead into auth, WebSocket, or production architecture too early.

## Project Path

```txt
/Users/aleksejveselov/dev/volex
```

## Current Structure

```txt
apps/
  web/  - React + Vite + TypeScript + MUI + React Router
  api/  - Node.js + Express + TypeScript + Prisma
```

## Frontend State

The frontend lives in:

```txt
apps/web
```

Current frontend progress:

- React app is running through Vite.
- Routing is connected inside `src/App.tsx`.
- Existing routes:
  - `/` redirects to `/login`;
  - `/login` renders `LoginPage`;
  - `/register` renders `RegisterPage`;
  - `/messenger` renders `MessengerPage`.
- `LoginPage` is built with MUI components.
- The login page has a link to `/register`.
- Prettier is installed in `apps/web`.

Useful commands:

```bash
cd apps/web
npm run dev
npm run build
npm run format
npm run format:check
```

## Backend State

The backend lives in:

```txt
apps/api
```

Current backend stack:

- Express
- TypeScript
- Prisma 7
- SQLite for local learning

Important files:

```txt
apps/api/src/index.ts
apps/api/src/lib/prisma.ts
apps/api/prisma/schema.prisma
apps/api/prisma7.config.ts
apps/api/dev.db
```

Current Prisma model:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Useful backend commands:

```bash
cd apps/api
npm run dev
npm run build
npm run db:migrate
npm run db:generate
npm run db:studio
```

## Existing API Routes

### GET `/health`

Checks that the backend server is alive.

Expected response:

```json
{
  "status": "ok"
}
```

### GET `/db-health`

Checks that Prisma can talk to the database.

Expected idea:

```json
{
  "status": "ok",
  "database": "connected",
  "usersCount": 1
}
```

### GET `/hello`

Practices `req.query`.

Examples:

```txt
GET /hello
GET /hello?name=Aleksey
```

Learned idea:

```txt
req.query reads values from the URL after ?
```

### POST `/users`

Creates a user in the database.

Example request:

```bash
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Aleksey"}'
```

Learned ideas:

```txt
app.use(express.json()) lets Express read JSON request bodies.
req.body reads JSON sent inside POST requests.
Prisma saves data into the database.
@unique in Prisma schema creates a unique constraint in the database.
Prisma error P2002 means a unique constraint failed.
409 Conflict is a good status when email is already taken.
```

### GET `/users`

Reads all users from the database.

Learned idea:

```txt
findMany() gets many records from a table.
```

### GET `/users/:id`

Reads one user by id.

Current behavior:

```txt
GET /users/1      -> 200 + user
GET /users/99999  -> 404 + { "message": "Пользователь не найден" }
GET /users/abc    -> 400 + { "message": "Id должен быть числом" }
```

Learned ideas:

```txt
req.params reads dynamic pieces from the URL, such as /users/1.
Number(req.params.id) converts the string URL param to a number.
Number.isNaN(id) checks whether the conversion failed.
```

## Concepts Already Touched

- Frontend and backend are separate programs.
- Backend receives HTTP requests and returns HTTP responses.
- Express route means: method + URL + handler.
- `GET` is usually for reading data.
- `POST` is usually for creating data.
- `req.query` reads URL query parameters.
- `req.body` reads JSON body data.
- `req.params` reads dynamic URL path parameters.
- `Number.isNaN(...)` can validate failed string-to-number conversion.
- Prisma is the layer that talks to the database.
- Database constraints are real rules inside the database, not only TypeScript checks.

## Next Lesson

Organize backend routes with Express Router:

```txt
src/routes/users.routes.ts
src/routes/health.routes.ts
```

Goals:

- understand why `src/index.ts` should not keep growing forever;
- understand `Router()` from Express;
- move `/health`, `/db-health`, and `/hello` into `health.routes.ts`;
- move `/users`, `/users/:id`, and `POST /users` into `users.routes.ts`;
- understand how `app.use('/users', usersRouter)` combines with `router.get('/:id', ...)`.

Suggested final structure:

```txt
apps/api/src/index.ts
apps/api/src/routes/health.routes.ts
apps/api/src/routes/users.routes.ts
```

Important behavior should stay the same:

```txt
GET /health
GET /db-health
GET /hello
GET /users
POST /users
GET /users/:id
```

Do not start login/auth/WebSocket until the student is comfortable with the basic CRUD routes.
