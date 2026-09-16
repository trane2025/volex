# Volex Lesson Progress

Last updated: 2026-09-16

## How To Resume

In a new chat, say:

```txt
Продолжаем урок Volex. Прочитай LESSON_PROGRESS.md и продолжи с раздела "Next Lesson".
```

The learning format should stay slow and practical:

- one small concept at a time;
- use slightly larger practical blocks when the student asks for more pace;
- explain what the code means before adding more code;
- give a small task for the student to do by hand;
- check the result after the student changes files;
- the assistant should run Prettier automatically; do not make formatting-only fixes a student exercise;
- do not run `lint`/`build` after every tiny TypeScript step unless the change is risky or the lesson is reaching a checkpoint;
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
- Redux Toolkit store is connected in `src/store/index.ts`.
- React Redux `<Provider>` wraps `<App />` in `src/main.tsx`.
- Existing routes:
  - `/` redirects to `/login`;
  - `/login` renders `LoginPage`;
  - `/register` renders `RegisterPage`;
  - `/messenger` renders `MessengerPage`.
  - `/admin` renders `AdminPage`.
- `LoginPage` is built with MUI components.
- The login page has a link to `/register`.
- `RegisterPage` is a controlled MUI form for `name` and `email`.
- `RegisterPage` now creates users through RTK Query with `useCreateUserMutation()`.
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
- Current app code no longer imports the old manual `src/api` user layer; `rg` only finds `apiClient`/`usersApi` inside `src/api` itself.
- On 2026-09-16, the old manual `src/api` layer was reviewed again and then removed after confirming it was unused by app screens.
- `TableUsers` has an edit icon button and accepts `onEditUser?: (user: User) => void`.
- `TableUsers` does not call `useUpdateUserMutation` directly; it only reports which user was selected.
- `ConfirmDialog` was added as a reusable confirmation dialog.
- `TextFieldsDialog` was added as a reusable dialog that collects named text fields through `FormData`.
- The frontend has a simple API layer in `src/api`.
- RTK Query has started in `src/store/features/users`.
- The `usersQuery` RTK Query API has `GET /users`, `POST /users`, `PATCH /users/:id`, and `DELETE /users/:id`.
- The `updateUser` mutation is typed as `builder.mutation<User, UpdateUserRequest>(...)`, uses `method: 'PATCH'`, invalidates the changed user and the users list, and is exported as `useUpdateUserMutation`.
- The `usersQuery.reducer` and `usersQuery.middleware` are connected in `src/store/index.ts`.
- The old manual `src/api` layer still exists for comparison/cleanup, but `RegisterPage` no longer uses it.
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

Current files:

```txt
apps/web/src/api/client.ts
apps/web/src/api/users.ts
apps/web/src/api/index.ts
```

`client.ts` is the shared fetch wrapper.

Available low-level methods:

```txt
apiClient.get(...)
apiClient.post(...)
apiClient.put(...)
apiClient.patch(...)
apiClient.delete(...)
```

`users.ts` is the user-specific API wrapper.

This old manual API layer is currently kept as learning material and for a later cleanup step. New user reads/creates/deletes are being moved to RTK Query.

Current user CRUD methods:

```txt
usersApi.getAll()
usersApi.getById(id)
usersApi.create(body)
usersApi.update(id, body)
usersApi.delete(id)
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

### Route files

Backend routes are now split into route modules:

```txt
apps/api/src/routes/health.routes.ts
apps/api/src/routes/users.routes.ts
```

`src/index.ts` connects route modules:

```txt
app.use(healthRouter)
app.use('/users', usersRouter)
```

Learned ideas:

```txt
Router() creates a small group of Express routes.
app.use('/users', usersRouter) adds the /users prefix to routes inside usersRouter.
usersRouter.get('/:id', ...) becomes GET /users/:id.
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

## Next Lesson

Continue after removing the old manual frontend API layer.

Suggested target:

```txt
apps/web/src/store/
apps/web/src/store/features/users/
apps/web/src/main.tsx
apps/web/src/pages/AdminPage/AdminPage.tsx
apps/web/src/pages/AdminPage/TableUsers.tsx
apps/web/src/pages/AdminPage/helpers/getUpdateUserErrorMessage.ts
apps/web/src/pages/RegisterPage/RegisterPage.tsx
apps/web/src/pages/RegisterPage/helpers/getCreateUserErrorMessage.ts
apps/web/src/UI/dialogs/ConfirmDialog.tsx
apps/web/src/UI/dialogs/TextFieldsDialog/
```

Goals:

- finish verification after removing the old manual `src/api` layer;
- keep one frontend API approach for user CRUD: RTK Query in `src/store/features/users`;
- explain that deleting unused old code reduces confusion and prevents duplicate API contracts from drifting apart;
- then move to the next topic only after `lint` and `build` pass;
- do not add login/auth/WebSocket yet.

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

Upcoming:

- treat the RTK Query CRUD migration as complete;
- next lesson can start with a calm review of polling versus real-time updates before choosing WebSocket or SSE;
- keep direct dialog imports for now instead of adding a broad shared barrel export;
- only after those simpler tools, return to real-time updates through WebSocket or SSE;
- do not recreate `src/api` unless a new non-RTK Query API layer is intentionally introduced later.

Important teaching note:

```txt
The student asked to do slightly larger lesson blocks than one-line microsteps.
Still keep each block practical and explain the concept before asking for changes.

Current RTK Query order:
1. store + Provider
2. GET /users
3. POST /users
4. DELETE /users/:id
5. PATCH /users/:id - RTK Query endpoint and admin edit UI completed; reusable dialog pattern is next
```
