# Volex Lesson Progress

Last updated: 2026-10-17

## Latest Lesson Checkpoint — 2026-10-17

- Latest continuation: the student implemented backend authorization in `apps/api/src/middleware/requireAdmin.ts` and connected it in `users.routes.ts`.
- `requireAdmin` reads `req.session.userId`, returns 401 for missing session identity or a missing database user, returns 403 for a non-ADMIN role, and calls `next()` only for ADMIN.
- `usersRouter.use(requireAdmin)` is placed after the public `POST /users` registration handler and before all GET, PATCH, and DELETE user routes. Registration still uses the database default USER role.
- Reviewed the student's middleware and route order; ran Prettier on both changed API files and `npm run build` in `apps/api`; all passed. An unused type import `NextFunction` remains as a minor student cleanup, with no build failure.
- The student reported the preceding guest/USER/ADMIN UI verification block working. Backend behavior after adding middleware has not yet been manually verified.
- First action in the next window: verify GET /users without cookies returns 401, with a USER session returns 403, and with an ADMIN session returns 200; verify registration remains public and ADMIN update/delete still work using disposable test data. Explain request flow and inspect results before moving on.
- Explained Express middleware (`req`, `res`, `next`), middleware ordering, terminating a response versus calling `next()`, and the distinction between 401 and 403. Also explained why request payloads remain visible in browser DevTools, HTTPS transport protection, bcrypt storage, and password reset instead of recovering an old password. Password recovery is not implemented.
- Continue student-written application code by default, with detailed explanations and blocks of 3–5 related tasks. Assistant reviews and formats. Do not start JWT or WebSocket yet. The Word plan is not authoritative.
- The older frontend checkpoint below is retained for context; its next-lesson instruction to implement middleware is now completed.

- The student explicitly asked the assistant to implement this frontend role block so they can review it, and requested clearer explanations of which application layer and files are involved.
- `ProtectedRoute` now accepts optional `requiredRole: UserRole`, reads the current user, redirects missing users to `/login`, and redirects role mismatches to `/messenger`.
- `App.tsx` requires `ADMIN` for `/admin`; `/messenger` still requires only authentication.
- `Navbar` shows the admin button only for `ADMIN` users.
- Changed frontend files were formatted; frontend lint and build passed. Browser behavior has not been manually verified in this block.
- Next lesson: explain/review these changes and verify guest, USER, and ADMIN navigation, then add backend authorization for administrative user routes. Frontend guards alone do not protect API access. Keep registration public.
- This checkpoint supersedes the older "First action on resume" below. Resume student-written code by default unless they ask for further implementation.

## How To Resume

In a new chat, say:

```txt
Продолжаем урок Volex. Прочитай LESSON_PROGRESS.md и продолжи с раздела "Next Lesson".
```

The learning format should stay practical, but use larger task blocks now:

- one practical concept at a time;
- prefer larger lesson blocks: explain the idea briefly, then give 3-5 related tasks;
- avoid spending too much context on tiny one-line changes unless the concept is genuinely new or risky;
- explain what the code means before adding more code;
- give a compact task block for the student to do by hand;
- check the result after the student finishes the whole block;
- the assistant must not write application code unless the student explicitly asks for implementation;
- when continuing lessons, the student writes the code and the assistant explains, reviews, formats, and verifies;
- the assistant should run Prettier automatically; do not make formatting-only fixes a student exercise;
- do not run `lint`/`build` after every tiny TypeScript step unless the change is risky or the lesson is reaching a checkpoint;
- avoid jumping ahead into WebSocket or production architecture too early;
- auth is now the next learning topic, but keep it practical: cookie session first, JWT later.

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
- Redux Toolkit store is connected in `src/store/index.ts`.
- React Redux `<Provider>` wraps `<App />` in `src/main.tsx`.
- Existing routes:
  - `/` redirects to `/login`;
  - `/login` renders `LoginPage`;
  - `/register` renders `RegisterPage`;
  - `/messenger` is wrapped in `ProtectedRoute` and renders `MessengerPage` for authenticated users;
  - `/admin` is wrapped in `ProtectedRoute` and renders `AdminPage` for authenticated users.
- `LoginPage` is built with MUI components.
- The login page has a link to `/register`.
- `LoginPage` is now a controlled login form for `email` and `password`.
- `LoginPage` uses `useLoginMutation()` from the auth RTK Query feature.
- `LoginPage` prevents default browser form submission, calls `POST /auth/login`, shows backend error messages, and redirects to `/messenger` after a successful login.
- `RegisterPage` is a controlled MUI form for `name`, `email`, and `password`.
- `RegisterPage` now creates users through RTK Query with `useCreateUserMutation()`.
- `RegisterPage` validates a minimum password length of 8 characters and sends the password only in the create-user request.
- `CreateUserBody` includes a required `password`; `UpdateUserBody` remains a separate type without password fields.
- Frontend `User` now includes `role: 'USER' | 'ADMIN'`.
- `RegisterPage` uses `getCreateUserErrorMessage(...)` to read backend error messages from RTK Query errors.
- `AdminPage` reads users through RTK Query with `useGetUsersQuery()`.
- `AdminPage` passes RTK Query options: `pollingInterval: 5000`, `refetchOnFocus: true`, and `refetchOnReconnect: true`.
- `AdminPage` renders the users table through `TableUsers`.
- `AdminPage` has loading, error, and empty states.
- `AdminPage` delete flow uses `useDeleteUserMutation()` with `.unwrap()` and `ConfirmDialog`.
- `AdminPage` uses `isLoading` for first load and `isFetching` for refresh/polling state.
- The refresh button uses `isFetching` to disable itself and show a spinner.
- `AdminPage` stores the selected edit user in `userToEdit`.
- `AdminPage` passes `onEditUser={handleOpenEditUser}` into `TableUsers`.
- `AdminPage` now opens a reusable `TextFieldsDialog` for editing a user.
- `AdminPage` submits edit values through `useUpdateUserMutation()` and `.unwrap()`.
- `AdminPage` sends an empty edit name as `undefined`, not as an empty string.
- `AdminPage` shows update loading state through `isLoadingUpdate`.
- `AdminPage` stores edit errors in `editUserErrorMessage` and reads backend messages through `getUpdateUserErrorMessage(...)`.
- Current app code no longer imports the old manual `src/api` user layer.
- On 2026-09-16, the old manual `src/api` layer was reviewed again and then removed after confirming it was unused by app screens.
- `TableUsers` has an edit icon button and accepts `onEditUser?: (user: User) => void`.
- `TableUsers` does not call `useUpdateUserMutation` directly; it only reports which user was selected.
- `ConfirmDialog` was added as a reusable confirmation dialog.
- `TextFieldsDialog` was added as a reusable dialog that collects named text fields through `FormData`.
- RTK Query has started in `src/store/features/users`.
- The `usersQuery` RTK Query API has `GET /users`, `POST /users`, `PATCH /users/:id`, and `DELETE /users/:id`.
- The `updateUser` mutation is typed as `builder.mutation<User, UpdateUserRequest>(...)`, uses `method: 'PATCH'`, invalidates the changed user and the users list, and is exported as `useUpdateUserMutation`.
- The `usersQuery.reducer` and `usersQuery.middleware` are connected in `src/store/index.ts`.
- RTK Query auth requests live in `src/store/features/auth`.
- The `authQuery` API has `POST /auth/login`, `GET /auth/me`, and `POST /auth/logout`.
- The auth RTK Query base query uses `credentials: 'include'` so browser cookies are sent with auth requests.
- The `authQuery.reducer` and `authQuery.middleware` are connected in `src/store/index.ts`.
- `ProtectedRoute` uses `useGetMeQuery()` to check the current cookie-session user before rendering protected pages.
- `/messenger` and `/admin` are now protected by `ProtectedRoute`.
- On 2026-10-13, the `/admin` `ProtectedRoute` change was reviewed; frontend Prettier, lint, and build passed.
- `Navbar` shows a logout button when `GET /auth/me` has a user and calls `POST /auth/logout`.
- The old manual `src/api` layer was removed after the user CRUD flows moved to RTK Query.
- Vite dev server proxies `/api` requests to `http://localhost:4000`.
- Prettier is installed in `apps/web`.

Useful commands:

```bash
cd apps/web
npm run dev
npm run build
npm run format
npm run format:check
```

### Frontend API Layer

The old manual frontend API layer was removed:

```txt
apps/web/src/api/client.ts
apps/web/src/api/users.ts
apps/web/src/api/index.ts
```

Current user CRUD requests live in RTK Query:

```txt
apps/web/src/store/features/users/users.ts
apps/web/src/store/features/users/types.ts
```

Learned ideas:

```txt
The UI should not call fetch everywhere directly.
An API wrapper keeps request URLs, HTTP methods, JSON parsing, and API errors in one place.
VITE_API_URL can configure the API base URL.
In local development, Vite proxy can forward /api requests to the backend and avoid browser CORS issues.
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
- `bcryptjs` for password hashing and comparison
- `express-session` for server-side sessions and `httpOnly` cookies
- simple string user roles: `"USER"` and `"ADMIN"`

Important files:

```txt
apps/api/src/index.ts
apps/api/src/lib/prisma.ts
apps/api/src/routes/auth.routes.ts
apps/api/src/types/express-session.d.ts
apps/api/prisma/schema.prisma
apps/api/prisma7.config.ts
apps/api/dev.db
```

Current Prisma model:

```prisma
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  name         String?
  passwordHash String?
  role         String   @default("USER")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
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
  -d '{"email":"test@example.com","name":"Aleksey","password":"password123"}'
```

Learned ideas:

```txt
app.use(express.json()) lets Express read JSON request bodies.
req.body reads JSON sent inside POST requests.
Prisma saves data into the database.
@unique in Prisma schema creates a unique constraint in the database.
Prisma error P2002 means a unique constraint failed.
409 Conflict is a good status when email is already taken.
Passwords must never be stored as plain text.
`bcryptjs.hash(password, 12)` stores a salted password hash in `passwordHash`.
The Prisma Client has a global `omit` rule that hides `passwordHash` from normal User query results.
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

### Route files

Backend routes are now split into route modules:

```txt
apps/api/src/routes/health.routes.ts
apps/api/src/routes/users.routes.ts
apps/api/src/routes/auth.routes.ts
```

`src/index.ts` connects route modules:

```txt
app.use(healthRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
```

Learned ideas:

```txt
Router() creates a small group of Express routes.
app.use('/users', usersRouter) adds the /users prefix to routes inside usersRouter.
usersRouter.get('/:id', ...) becomes GET /users/:id.
```

### POST `/auth/login`

Checks an email and password with `bcryptjs.compare(...)`.

Current state:

```txt
- unknown users and wrong passwords both return 401 with the same message;
- the query locally overrides the global passwordHash omission so the hash can be checked;
- successful responses explicitly contain only public user fields;
- express-session middleware is connected and configured with an httpOnly cookie;
- SESSION_SECRET is required and is configured locally;
- session data is currently stored in MemoryStore, so restarting the API clears sessions.
```

The cookie-session backend flow is now implemented:

```txt
- req.session.userId is assigned only after the password is validated;
- GET /auth/me reads userId from the session and returns the current user or 401;
- POST /auth/logout destroys the session and returns 204;
- POST /auth/login now includes `role` in its public response object;
- API formatting and TypeScript build pass.
```

### PATCH `/users/:id`

Updates an existing user.

Current behavior:

```txt
PATCH /users/1      -> 200 + updated user
PATCH /users/99999  -> 404 + { "message": "Пользователь не найден" }
PATCH /users/abc    -> 400 + { "message": "Id должен быть числом" }
```

Learned ideas:

```txt
PATCH updates part of an existing record.
Prisma update() changes a record in the database.
Prisma error P2025 means the record to update was not found.
The update data object can be built only from fields that were sent in req.body.
```

### DELETE `/users/:id`

Deletes an existing user.

Current behavior:

```txt
DELETE /users/1      -> 200 + deleted user
DELETE /users/99999  -> 404 + { "message": "Пользователь не найден" }
DELETE /users/abc    -> 400 + { "message": "Id должен быть числом" }
```

Learned ideas:

```txt
DELETE removes an existing record.
Prisma delete() removes a record from the database.
Prisma error P2025 also appears when the record to delete was not found.
```

## Concepts Already Touched

- Frontend and backend are separate programs.
- Backend receives HTTP requests and returns HTTP responses.
- Express route means: method + URL + handler.
- Express Router groups related routes in separate files.
- `app.use('/prefix', router)` connects a router with a URL prefix.
- `GET` is usually for reading data.
- `POST` is usually for creating data.
- `PATCH` is usually for updating part of an existing record.
- `DELETE` is usually for deleting an existing record.
- `req.query` reads URL query parameters.
- `req.body` reads JSON body data.
- `req.params` reads dynamic URL path parameters.
- `Number.isNaN(...)` can validate failed string-to-number conversion.
- Prisma is the layer that talks to the database.
- Database constraints are real rules inside the database, not only TypeScript checks.
- Redux Toolkit store gives RTK Query a place to keep cached request state.
- RTK Query generates hooks from endpoint names, such as `useGetUsersQuery` and `useCreateUserMutation`.
- `.unwrap()` makes an RTK Query mutation feel like a normal async function: success returns data, failure throws.
- `tagTypes` declares allowed cache tag categories, such as `User`.
- `providesTags` describes which cache tags a query result provides.
- `invalidatesTags` marks cache tags stale after a mutation so active queries can refetch.
- `id: 'LIST'` is a local convention for tagging the whole users list, not a backend id.
- `isLoading` means first load without data; `isFetching` means any in-flight request, including refetch/polling.
- A temporary duplicate API layer can be helpful while learning, but later it becomes a maintenance risk because the same backend operation can be described in two places.
- Authentication proves who the user is; authorization decides what that user may access.
- A role is authorization data. In the current learning version it is stored as a Prisma `String` with default `"USER"` and typed on the frontend as `'USER' | 'ADMIN'`.
- Password hashing is one-way; login uses `compare(...)`, not decryption.
- A salt is generated by bcrypt and stored as part of the hash.
- A session keeps login state on the server; the browser receives only a signed session-id cookie.
- `httpOnly` prevents page JavaScript from reading the session cookie.
- `saveUninitialized: false` avoids creating sessions for anonymous requests that store no session data.
- `resave: false` avoids saving unchanged sessions on every request.
- Prisma schema changes, database migrations, and generated Prisma Client types are separate steps.

## Next Lesson

Continue the authentication lesson without assistant-written app code.

The student asked for a faster lesson format with larger task blocks. Avoid one-line microtasks when a larger practical block would be clearer.

Current checkpoint:

```txt
- passwordHash exists in Prisma and the SQLite migration is applied;
- registration hashes passwords with bcrypt cost 12;
- passwordHash is globally omitted from normal Prisma User results;
- the registration UI sends a password and was manually verified;
- POST /auth/login finds a user and compares the password;
- express-session middleware and the SessionData userId type are connected;
- wrong passwords no longer write userId into the session;
- GET /auth/me returns the session user or 401;
- POST /auth/logout destroys the session and returns 204;
- API formatting and build pass after completing the backend session routes;
- frontend auth RTK Query feature is created and connected to the Redux store;
- LoginPage calls the login mutation, prevents native GET form submission, shows errors, and redirects to /messenger after success;
- frontend formatting, lint, and build pass after connecting LoginPage;
- `ProtectedRoute` has been created from `useGetMeQuery()`;
- `/messenger` is protected by `ProtectedRoute`;
- logout UI has been added to `Navbar`;
- the auth RTK Query cache uses an `Auth` tag so login/logout can refresh `GET /auth/me`;
- the student has just wrapped `/admin` in `ProtectedRoute`;
- the `/admin` protection change was reviewed; frontend Prettier, lint, and build pass;
- the first role block is complete: Prisma `User.role String @default("USER")`, SQLite migration, backend login response includes `role`, frontend `User` has `role: 'USER' | 'ADMIN'`;
- backend Prettier/build and frontend Prettier/lint/build pass after the first role block;
- the automated HTTP chain could not be completed because isolated command processes could not connect to the locally started port, although the API started successfully.
```

First action on resume:

```txt
Continue role authorization: protect `/admin` by checking `user.role === 'ADMIN'`, not only login state.
```

Continue in this order:

1. Verify the completed cookie-session route protection block: `/messenger`, `/admin`, refresh restoration, and logout.
2. Explain authentication vs authorization using the current app: "logged in" is not the same as "admin".
3. Start the roles block in larger practical steps: add a user role to the backend data model, expose it safely, and then protect `/admin` by role.
4. Only after cookie-session plus role authorization works, start the separate JWT lesson.

Teaching rules remain unchanged:

- the student writes application code unless explicitly asking the assistant to implement;
- use practical blocks rather than one-line microsteps;
- explain before asking for changes;
- inspect each student change and run Prettier automatically;
- run lint/build at meaningful checkpoints.

Completed:

- explained what Redux Toolkit store is and why React needs `<Provider>`;
- added the store as a tiny step;
- discussed why `createApi(...)` is more than a normal reducer;
- discussed folder architecture and chose feature co-location;
- created `src/store/features/users/`;
- created a `usersQuery` RTK Query API with only `GET /users`;
- connected `usersQuery.reducer` to `combineReducers(...)`;
- connected `usersQuery.middleware` with `getDefaultMiddleware().concat(...)`;
- explained why RTK Query needs middleware;
- verified that the app still builds after RTK Query store connection;
- verified that ESLint passes;
- ran `npm run format`;
- exported `useGetUsersQuery` from `src/store/features/users/users.ts`;
- replaced the manual `AdminPage` loading code with `useGetUsersQuery()`;
- used `data: users = []` so the UI can treat missing data as an empty list;
- moved the users table into `TableUsers`;
- added reusable `ConfirmDialog`;
- added a first `deleteUser` RTK Query mutation;
- connected delete confirmation UI in `AdminPage`;
- added RTK Query cache invalidation for delete with `providesTags` and `invalidatesTags`;
- added `.unwrap()` to the delete flow;
- explained why `await deleteUser(id)` does not throw like a normal async function unless `.unwrap()` is used;
- explained the difference between `isLoading` and `isFetching`;
- changed refresh button disabling from `isLoading` to `isFetching`;
- added a refresh-button spinner while `isFetching`;
- added `pollingInterval: 5000` to `useGetUsersQuery`;
- added `refetchOnFocus: true`;
- added `refetchOnReconnect: true`;
- explained `tagTypes: ['User']`;
- explained `providesTags`, `invalidatesTags`, and why `id: 'LIST'` is uppercase by convention;
- added `CreateUserBody` in `src/store/features/users/types.ts`;
- added `createUser` mutation with `POST /users`;
- exported `useCreateUserMutation`;
- migrated `RegisterPage` from manual `usersApi.create(...)` to `useCreateUserMutation()`;
- replaced manual `isSubmitting` state with mutation `isLoading: isCreatingUser`;
- added `getCreateUserErrorMessage(...)` helper for RTK Query create-user errors;
- added `UpdateUserBody = Partial<CreateUserBody>`;
- added `UpdateUserRequest` with `id` and `body`;
- explained the `builder.mutation<Response, Argument>` generic using create/delete/update examples;
- explained why update needs both `id` for the URL and `body` for the JSON request body;
- finished the `updateUser` mutation with `method: 'PATCH'`;
- kept update invalidation for both `{ type: 'User', id }` and `{ type: 'User', id: 'LIST' }`;
- exported `useUpdateUserMutation` from `usersQuery`;
- ran `npm run format` after the user edited `users.ts`;
- added an edit icon button to `TableUsers`;
- typed the table callback as `onEditUser?: (user: User) => void`;
- explained that `TableUsers` should pass the selected `User` upward instead of building an `UpdateUserRequest` itself;
- ran `npm run format` after editing the table props;
- verified that `npm run build` passes after the table prop cleanup;
- added `userToEdit` state in `AdminPage`;
- passed `onEditUser={setUserToEdit}` into `TableUsers`;
- added a temporary info alert showing the selected edit user email;
- added `editEmail` and `editName` state for the future edit form;
- added `handleOpenEditUser(user)` to set `userToEdit`, `editEmail`, and `editName`;
- replaced direct `onEditUser={setUserToEdit}` with `onEditUser={handleOpenEditUser}`;
- kept the user's `useUpdateUserMutation()` groundwork in `AdminPage`; `updateUser`, `editEmail`, and `editName` are not used yet and should be wired in the next step;
- ran `npm run format` after the `AdminPage` edit-state step;
- user replaced the temporary edit flow with a reusable `TextFieldsDialog`;
- added `TextFieldsDialogValues<FieldName>` typed as `Record<FieldName, string>`;
- `TextFieldsDialog` collects submitted values from `FormData`;
- `AdminPage` now renders edit fields for `name` and `email` inside `TextFieldsDialog`;
- `AdminPage` calls `updateUser({ id: userToEdit.id, body: { email, name } }).unwrap()` on edit submit;
- changed edit submit so an empty name is sent as `undefined` instead of `''`;
- added `getUpdateUserErrorMessage(...)` for RTK Query update errors;
- update dialog uses `isLoadingUpdate` to disable fields/buttons and show a submit spinner;
- ran `npm run format` after the reusable edit dialog implementation;
- verified that `npm run lint` passes after the reusable edit dialog implementation;
- verified that `npm run build` passes after the reusable edit dialog implementation;
- discussed barrel exports and decided not to add a shared dialogs index because tests can end up loading everything re-exported from a broad index;
- ran `npm run format` after changing empty edit names to `undefined`;
- verified that `npm run build` passes after changing empty edit names to `undefined`;
- checked old manual API usage with `rg`; no app imports remain outside `src/api` itself;
- reviewed `src/api/client.ts`, `src/api/users.ts`, and `src/api/index.ts` after the RTK Query CRUD migration;
- confirmed that the manual `usersApi` still mirrors user CRUD operations but is not currently used by app screens;
- explained the cleanup checkpoint: keep it for comparison while learning, or remove it to avoid two API layers drifting apart;
- user removed `apps/web/src/api/client.ts`, `apps/web/src/api/users.ts`, and `apps/web/src/api/index.ts`;
- confirmed with `rg` that no frontend imports or references remain for `usersApi`, `apiClient`, `ApiError`, or `../../api`;
- ran Prettier on `LESSON_PROGRESS.md` after documenting the cleanup; the file was already formatted;
- verified that `npm run format:check` passes after deleting the old manual frontend API layer;
- verified that `npm run lint` passes after deleting the old manual frontend API layer;
- verified that `npm run build` passes after deleting the old manual frontend API layer;
- verified that `npm run format:check` passes;
- verified that `npm run lint` passes;
- verified that `npm run build` passes.
- added nullable `passwordHash String?` to the Prisma `User` model so existing users remain valid;
- created and applied migration `20260916221221_add_password_hash`;
- regenerated Prisma Client after the schema change;
- installed `bcryptjs` and explained hashing, salts, cost 12, and `compare(...)`;
- added password validation and bcrypt hashing to `POST /users`;
- configured global Prisma `omit` so `passwordHash` is hidden from normal User query results;
- added a required password to the frontend create-user type and kept update-user fields separate;
- added the controlled password field and validation to `RegisterPage`;
- manually verified registration and confirmed that Studio stores a bcrypt hash rather than the plain password;
- worked around the Prisma 7.10 Studio SQLite URL parsing bug with the `db:studio` npm script using an absolute `file://$PWD/dev.db` URL;
- verified API build after password hashing changes;
- verified frontend Prettier, lint, and build after registration password changes;
- created `POST /auth/login` with identical `401` responses for unknown users and wrong passwords;
- used a local Prisma omit override to read `passwordHash` only inside login;
- explicitly returned public user fields from a successful login response;
- installed `express-session` and `@types/express-session`;
- added `SESSION_SECRET` to local environment configuration and `.env.example`;
- added Express SessionData type augmentation with optional `userId`;
- configured session middleware with `httpOnly`, `sameSite: 'lax'`, production-only `secure`, seven-day `maxAge`, `resave: false`, and `saveUninitialized: false`;
- verified the API build after session middleware was added;
- fixed the security-critical ordering bug so `POST /auth/login` writes `userId` only after a valid password;
- added `GET /auth/me` to restore the current user from the server-side session;
- added `POST /auth/logout` using `req.session.destroy(...)`;
- ran API Prettier and verified that the API TypeScript build passes after completing the session routes.
- created `apps/web/src/store/features/auth/` with `LoginBody`, `authQuery`, and hooks for login, me, and logout;
- connected `authQuery.reducer` and `authQuery.middleware` in the frontend Redux store;
- added `credentials: 'include'` to the auth base query so session cookies are sent;
- connected `LoginPage` to `useLoginMutation()` with controlled email/password state;
- added `getLoginErrorMessage(...)` for RTK Query login errors;
- fixed a nested form issue in `LoginPage` that caused the browser to submit fields as a native GET query string;
- verified frontend Prettier, lint, and build after connecting login.

Upcoming:

- treat the RTK Query CRUD migration as complete;
- review and verify the student's `/admin` ProtectedRoute change;
- add role-based authorization so `/admin` is available only to admin users;
- continue using the basic `httpOnly` cookie-session flow before JWT;
- JWT is planned as a follow-up lesson after the cookie-session flow works;
- assistant must ask before implementing any application-code changes;
- the student should continue writing auth code by hand;
- keep direct dialog imports for now instead of adding a broad shared barrel export;
- return to real-time updates through WebSocket or SSE after the auth lessons;
- do not recreate `src/api` unless a new non-RTK Query API layer is intentionally introduced later.

Important teaching note:

```txt
The student asked to do larger lesson blocks than one-line microsteps.
Use compact 3-5 task blocks, then review the whole result.
Still keep each block practical and explain the concept before asking for changes.

Current RTK Query order:
1. store + Provider
2. GET /users
3. POST /users
4. DELETE /users/:id
5. PATCH /users/:id - RTK Query endpoint and admin edit UI completed; reusable dialog pattern is next

Current auth teaching direction:
1. cookie-session login
2. `GET /auth/me`
3. protected `/messenger` and `/admin` for authenticated users
4. redirect after login/logout
5. role-based authorization for `/admin`
6. JWT migration as the next auth level
```
