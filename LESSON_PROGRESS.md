# Volex Lesson Progress

Last updated: 2026-10-26

## Latest Lesson Checkpoint — 2026-10-26 (refresh sessions implemented)

- Student reported timed redirects from messenger to login and explicitly chose implementing refresh sessions instead of extending access JWT lifetime. This authorizes the assistant's implementation of this block; normally the student still writes application code. The new refresh-session work supersedes the earlier plan to defer refresh. No message CRUD, message persistence or typed custom event lesson was implemented.
- Access JWT remains 20 minutes. Login now creates a seven-day absolute refresh session and sets an httpOnly, SameSite=Lax refreshToken cookie (Secure in production). Prisma stores only a SHA-256 hash of a random 32-byte opaque token. Added RefreshSession with user relation/cascade deletion, expiry and indexes. Migration 20261026110000_add_refresh_sessions was applied to the local dev.db; existing users were preserved and Prisma Client regenerated.
- POST /auth/refresh rotates the token transactionally, keeps the original session expiry, sets fresh access/refresh cookies and returns 204. Missing, malformed, expired or revoked tokens return 401 and clear both cookies. POST /auth/logout revokes the current refresh session and clears both cookies; other sessions remain active. Auth cookie responses use Cache-Control: no-store. Expired session rows are cleaned on login and when encountered during refresh.
- Frontend authSession.ts shares an in-flight refresh promise between HTTP and sockets. Cookie-changing login/logout/refresh requests are serialized, including across same-origin tabs through Web Locks when available; the fallback serializes within one tab. baseQuery refreshes after 401 and retries the original request once. Wrong-password login, logout and public registration do not trigger refresh. Transient refresh failure is returned as FETCH_ERROR, not final unauthorized.
- ProtectedRoute now redirects only on confirmed getMe 401. Existing cached users keep the messenger mounted during transient API errors; initial failures show a retry action. This is cached UI continuity, not offline authorization: the server still protects requests.
- Socket JWT rejection now includes data.code = UNAUTHORIZED. MessengerPage calls the same refresh helper before reconnecting, retries transient refresh failure after five seconds, dispatches authUnauthorized for an ended session, and cancels the pending reconnect/timer on cleanup. Transport failure still uses Socket.IO's own reconnection behavior. React StrictMode and cleanup remain enabled; the first development connection can still log an aborted-WebSocket warning.
- Validation: API and frontend builds passed; frontend lint passed; changed files formatted. npm run test:auth in each app passed: six API scenario subtests (login cookies/hash, expired-access restoration/rotation, concurrent token reuse, logout/isolation, missing/expired/deleted-user sessions, websocket authorization with refreshed access) and six frontend scenario subtests (concurrent refresh/original-body retry, transient versus final failure, bounded retry, wrong-password exclusion, login/logout serialization, ProtectedRoute rendering with transient failures versus 401). API tests used a separate temporary database and server. Frontend checks used Vite SSR and mocked fetch; they are not end-to-end browser checks.
- Existing logins have no refresh cookie: the student must log in once again to create a refresh session. Browser verification of the new refresh flow is pending. Do not claim actual browser recovery or a 20-minute waiting test was performed. Original browser socket userId/navigation/API-restart checks also remain unconfirmed; standalone socket transport checks had reached JWT middleware both directly and via Vite.
- Limitations: refresh lasts seven days from login, not a sliding lifetime. Existing access JWTs remain valid until expiry even after refresh-session revocation; already-open sockets still authenticate only on connection and are not forcibly revoked on logout/expiry. Rotation has no session-family theft/reuse detection or recovery for a lost rotation response. Cross-tab coordination falls back to per-tab serialization where Web Locks are unavailable.
- Next: confirm the new browser session restores access without leaving messenger, then resume the prepared typed session:check/ack lesson and subsequently in-memory messages. Explain architecture/file roles/event flow before small student-written blocks. Maintain this file only among lesson documents. Student requested committing the accumulated lesson changes; this checkpoint accompanies that commit (previous HEAD: 7f90fc2). docs/ and other documents remain untouched. The pre-existing App.tsx debug console.log is preserved in the working tree and excluded from the lesson commit. No push requested.

## Latest Lesson Checkpoint — 2026-10-26 (typed event lesson prepared)

- Resumed from the socket JWT authentication checkpoint and reviewed the current API middleware, JWT helper, Vite proxy, socket client, MessengerPage lifecycle, and ChatHeader. No functional errors found within the current lesson scope. Application code was not changed; previous build/lint results remain those recorded below, not new runs.
- New browser verification remains pending: no Volex tab was available through the connected browser inventory, and native Chrome inspection timed out. Asked the student to open /messenger with a valid login and confirm the API connection log contains the expected userId. Navigation cleanup and API restart/reconnection checks also remain unconfirmed. Do not repeat completed HTTP/JWT browser checks.
- Student replied that there is an error or no connection. Pause the typed-event implementation until this is diagnosed. A local listener check found Node listening on API port 4000 and Vite port 5173; no app terminal is attached to this chat. The exact browser/API error is still needed; running processes alone do not confirm successful socket authentication.
- Student supplied the browser warning at MessengerPage.tsx:38: WebSocket closed before connection was established. That line is cleanup socket.disconnect(); main.tsx enables React StrictMode. The development setup/cleanup/setup cycle is a likely explanation for the first aborted connection, not proof of a persistent failure. Still need the final header status and API connection/userId log to confirm the second connection succeeds. Keep StrictMode and cleanup intact while diagnosing.
- Student confirmed there is no API connection log. Assistant checked the running services: Engine.IO polling handshake returned HTTP 200 directly on port 4000 and through Vite on 5173. Actual Socket.IO websocket-only clients without cookies received the expected middleware error "Не авторизован" on both endpoints, confirming the WebSocket/proxy path reaches JWT middleware. These transport diagnostics do not confirm browser cookie authentication. Need browser console output after the initial cleanup warning and the final header status; no application changes made.
- Student now requests avoiding repeated timed logouts and clarified that the page redirects to login after a time interval. Current JWT/cookie lifetime is 20 minutes with no refresh flow; expiry can explain a subsequent unauthorized request/redirect, but no redirect timer was found. Asked the student to choose between extending both access-token/cookie lifetime to seven days for the lesson or implementing refresh sessions with short-lived access tokens. Await this scope choice before changing authentication. The original timed-logout request authorizes the chosen fix; no application changes have yet been made for it.
- Prepared the next student-written block: matching socket event contracts in each app, typed server SocketData.userId, typed client Socket, a session:check event, and an acknowledgement returning { userId } from socket.data. The client will request it in handleConnect with a five-second timeout. These are lesson instructions only, not implemented or tested. Temporary duplicated contracts avoid introducing package/build configuration in this block; a shared contract package can follow later.
- Explain file roles and the full connect/authenticate/emit/ack flow before code. Ack confirms this handler responded; it does not persist or broadcast a message. TypeScript contracts do not validate network input at runtime. Keep a runtime callback check on the server. Existing JWT/auth limitations remain unchanged. Continue with in-memory messages after reviewing the student's event implementation.
- Student writes application code; assistant explains, reviews, formats, and verifies. Only LESSON_PROGRESS.md was edited in this continuation. Commit remains 7f90fc2; no commit or push. docs/ and other documents remain untouched.

## Latest Lesson Checkpoint — 2026-10-26 (socket JWT authentication)

- Student implemented Socket.IO authentication in apps/api/src/index.ts: io.engine.use(cookieParser()) parses transport cookies; io.use checks accessToken, calls the existing verifyAccessToken, stores the verified user id in socket.data.userId, and rejects missing/invalid/expired tokens with next(new Error('Не авторизован')). Connection logs include userId; disconnect logs include the reason.
- Assistant reviewed the implementation and MessengerPage lifecycle/status code at the student's request. No functional errors found in this lesson's scope; formatted API entry point. Frontend build and lint and API build passed on 2026-10-26. Socket runtime/browser authentication and navigation/server-restart checks are not yet confirmed; do not describe these as tested. Previously confirmed HTTP/JWT browser checks must not be repeated.
- Current socket authentication checks JWT only at connection time, including new connections after disconnect. It does not check user existence in the database, revoke existing connections on logout/token expiration, or refresh tokens. connect_error currently updates connection state and logs the error; it does not dispatch the HTTP authUnauthorized event. Middleware rejection does not automatically retry like a transport failure.
- Next lesson: briefly confirm the new socket connection shows the expected userId, then proceed to typed custom Socket.IO events and an initial client/server exchange with acknowledgement, followed by in-memory chat messaging. Start with architecture, file roles, event flow and limitations; then give connected code blocks with syntax/types explained. Do not start Prisma migrations or HTTP message CRUD. Refresh sessions remain future work, not implemented.
- Both apps' direct dependencies are pinned to installed lockfile versions; app-level .npmrc files set save-exact=true. Use npm ci for reproducible installs; do not update packages incidentally.
- Latest commit remains 7f90fc2; current changes are uncommitted and no push was requested or performed. docs/ remains untracked and untouched. Continue maintaining LESSON_PROGRESS.md; do not modify the other previously created document. Student normally writes application code. Permission to fix mistakes in this review was for this turn, not blanket permission to implement future lessons.

## Latest Lesson Checkpoint — 2026-10-22 (socket lifecycle and pinned dependencies)

- Student implemented MessengerPage socket connect/disconnect/connect_error handlers, React connection state, and cleanup that removes specific listeners and disconnects on unmount. ChatHeader receives isConnected. Corrected the lesson example: palette paths belong in Typography sx.color; student applied the fix. Full navigation/server-restart browser checks remain unconfirmed.
- At the student's request, pinned all direct dependencies and devDependencies in both apps to their current package-lock versions, verified against installed node_modules. Synchronized lockfile root manifests without changing resolved dependency records. Added save-exact=true in each app's .npmrc for future installs. Use npm ci in each app to reproduce the locked dependency tree.
- Discussed short-lived access tokens plus long-lived refresh sessions as future work; no refresh flow implemented. Continue Socket.IO first. Socket authentication and message events remain unimplemented.
- Student clarified that LESSON_PROGRESS.md must continue to be maintained; the other previously created document and docs/ must remain untouched. Student writes application logic unless explicitly requesting implementation. No commit or push requested.

## Latest Lesson Checkpoint — 2026-10-22 (profile page and messenger UI)

- At the student's explicit request, moved the existing profile card and edit logic to /profile (ProfilePage), moved EditProfileDialog alongside it, protected the new route, and added profile/messenger links to Navbar. Existing getMe/updateMe/dialog logic is preserved.
- MessengerPage now contains presentation-only ChatSidebar, ChatHeader, MessageList, and MessageComposer components. Layout follows a familiar messenger structure, with a compact avatar sidebar on small screens, a chat header, empty conversation area, and composer. Light/dark theme is supported. Search, attachment, and send controls are disabled; no mock messages, new messaging logic, or socket lifecycle were added.
- Student has installed Socket.IO on the API and added a shared Node HTTP server with connection/disconnection logging. Vite proxies /socket.io with ws: true. The client lives in apps/web/src/socket/socket.ts with autoConnect: false and websocket transport. It is not yet connected by MessengerPage. Socket authentication and message events are not implemented.
- Frontend build (including TypeScript), lint, and API build passed. Changed UI files and the existing server entry/Vite config were formatted. New UI/profile browser verification has not been performed by the assistant.
- Student requested committing accumulated work, excluding docs/. No push requested. Continue the Socket.IO lesson from the existing server/client setup; do not restart completed JWT/auth lessons or require Prisma message persistence first.
- Student normally writes code; explicit implementation authorization covered this profile/UI block. Preserve the teaching format: overall architecture first, then connected small code blocks with syntax/type explanations.

## Latest Lesson Checkpoint — 2026-10-21 (shared base query)

- At the student's explicit request, the assistant implemented the shared wrapper discussed below. This authorization was for this block; the student normally writes application code.
- Added apps/web/src/store/baseQuery.ts: delegates to fetchBaseQuery with shared baseUrl and credentials: 'include', dispatches authUnauthorized on status 401 unless extraOptions.skipAuthRevalidation is true, and returns the original result unchanged.
- Placed authEvents.ts inside store/features/auth at the student's suggestion. The wrapper imports the event directly from that file, avoiding the auth barrel and a circular dependency through authQuery.
- Both authQuery and usersQuery now use the shared baseQuery. login, getMe, logout, and public createUser opt out of the wrapper's auth revalidation. Existing endpoint tag invalidation remains unchanged.
- authListener now listens to authUnauthorized instead of enumerating rejected endpoints. It still invalidates Auth; existing store middleware registration is unchanged.
- Explained the overall request/event/revalidation/ProtectedRoute flow, wrapper types and syntax, endpoint extraOptions, and file placement.
- Changed frontend files were formatted; frontend build (including TypeScript) and lint passed. The student subsequently confirmed the browser redirect occurred in the missing-cookie check and explicitly asked to move on. Accept that confirmation and close this lesson block; do not repeat auth checks. The student did not separately report the wrong-password check.
- The student explicitly rejected starting with Prisma message persistence and requested proceeding directly to WebSockets. Next block is Socket.IO server/client connection, an HTTP server shared with Express, Vite WebSocket proxy, and React connection lifecycle. socket.io-client is already installed; socket.io server is not yet installed. Message schema/migration work is deferred; do not require it before sockets. Explain architecture and then connected code blocks; student writes code unless explicitly requesting implementation. Initial connection demonstration does not yet authenticate sockets or exchange user messages; existing Express requireAuth does not automatically protect Socket.IO.
- Limitations remain: no refresh token, no idle expiration timer, no explicit coordination of concurrent 401 events, and no full cache cleanup on this path. Existing ProtectedRoute redirects on any getMe error, including network/server errors.
- Preserve existing staged/unstaged changes. docs/ remains untouched. No commit or push requested or performed. This checkpoint supersedes the earlier checkpoints below.

## Latest Lesson Checkpoint — 2026-10-21

- The student confirmed all four post-JWT browser checks passed: login and messenger navigation, accessToken cookie attributes, reload with successful /auth/me, and logout with cookie removal and protected-route rejection.
- The student completed the expiration experiment: the open page remained visible, and reloading after expiration redirected to login. The student restored 20m; the assistant verified it in jwt.ts.
- At the student's explicit request, the assistant completed src/middleware/authListener.ts and connected it with prepend in store/index.ts. It matches rejected updateMe/getUsers/updateUser/deleteUser requests and invalidates Auth only for status 401. The explicit matcher guard inside effect fixes TypeScript inferring Action without payload. Login and getMe are excluded to avoid treating wrong passwords as expired auth or creating a revalidation loop.
- Frontend Prettier, build (including TypeScript), and lint passed. Browser verification of the new listener remains pending: with the profile dialog open, remove accessToken in DevTools, then save; expect PATCH /auth/me 401, GET /auth/me 401, and navigation to /login without a page reload. This simulates missing authentication, not JWT expiration itself.
- The student needs the overall architecture and purpose explained before isolated code edits: describe the problem, participating layers, request/action flow, then exact edits. The implementation request applies to this block; otherwise preserve the teaching contract.
- Server token expiration and browser cookie lifetime are independent, and cached frontend user data does not automatically disappear when a token expires. The new listener reacts to protected-request failures; it does not schedule expiration checks on an idle page.
- Explained isAnyOf: it returns a predicate combining endpoint matchRejected functions with OR semantics; matching a failed endpoint and checking status 401 are separate steps. The student correctly identified that the current explicit list must be extended for each new protected endpoint.
- Discussed a shared fetchBaseQuery wrapper as a possible next improvement to centralize 401 handling. This is a proposed direction, not implemented. Explain the architecture before choosing edits: request -> shared base query -> unauthorized event/handling -> auth revalidation -> ProtectedRoute. Account for login's wrong-password 401 and getMe's own 401 to avoid loops; preserve 403 and network-error behavior. Avoid circular imports between the base query and API modules. No refresh-token flow has been implemented or assigned.
- Resume with the overall picture, acknowledge that browser verification of the existing listener is still pending, then proceed toward shared request/error handling in small coherent lesson blocks. Do not repeat completed JWT migration or expiration exercises. Do not claim the current listener handles every request automatically.
- Explicit lesson format going forward: first explain the user-visible problem, intended result, participating files/layers and their responsibilities, and the complete flow with an example or diagram. Explain why this approach was chosen and its limitations. Only then provide code in 3–5 related steps, with exact file locations/imports and explanations of new syntax, types, arguments and return values. Do not present disconnected snippets without context.
- Handoff requested for a new window. Changes remain uncommitted; this turn did not request a commit or push. Preserve existing staged/unstaged changes. docs/ remains untracked and outside scope.
- Teaching contract remains: student writes application code; assistant explains, reviews, formats, and verifies. Do not modify docs/ without a separate request.
- This checkpoint supersedes next-step instructions below.

## Latest Lesson Checkpoint — 2026-10-20

- The student migrated usersRouter to requireAuth + requireAdmin, keeping public registration before those middleware. requireAdmin now reads req.userId.
- The student removed express-session setup, login assignment, logout destruction, type augmentation, dependencies, and SESSION_SECRET from .env.example. Local .env was not inspected.
- Logout now clears accessToken and returns 204. API Prettier and build passed.
- The assistant ran 30 successful HTTP assertions against the actual API source on a separate port with a temporary SQLite database initialized from repository migrations and an ephemeral JWT secret. No student database records were changed.
- Verified: missing/invalid JWT and old session cookie rejected; public registration; wrong-password rejection; successful login without passwordHash leakage; cookie HttpOnly, SameSite=Lax, Path=/, Max-Age=1200; USER denied administrative GET/PATCH/DELETE; ADMIN allowed list/detail; profile update, trimming, persistence, and clearing; logout cookie expiration and 204; no-cookie access rejected after logout; logout with invalid token; expired JWT and deleted-user rejection.
- These are HTTP checks, not browser UI checks. Browser navigation, cookie handling, and frontend login/logout integration have not been verified since migration. Next continue with that integration check, then discuss JWT expiration behavior.
- Teaching contract remains: student writes application code; assistant explains exact edits in small related blocks, reviews, formats, and verifies. Do not modify docs/ without a separate request.
- This checkpoint supersedes next-step instructions in the older checkpoint below.

## Latest Lesson Checkpoint — 2026-10-19

- This checkpoint accompanies the commit `Add profile editing and begin JWT authentication migration` on main. The user requested committing/pushing the lesson work and continuing in a new conversation. Check Git for the final commit hash and remote status.
- Profile editing is complete: PATCH /auth/me validates a string name, trims it, stores an empty name as null, and returns the updated public user. MessengerPage and EditProfileDialog connect the updateMe mutation, loading/error states, and conditional rendering. UpdateMeBody is re-exported.
- The student confirmed all profile browser checks passed before the JWT migration: saving, trimming/clearing name, reopening, refresh persistence, and failed-save feedback/retry. Earlier cookie-session auth/admin/logout/shared UI checks also passed. Accept these results; do not repeat them as old work.
- JWT is now partially integrated. jose creates HS256 access tokens with sub, iat, and a 20-minute expiration. verifyAccessToken checks the signature, allowed algorithm, required sub/iat/exp, and a positive safe-integer user id.
- Login issues an httpOnly accessToken cookie with sameSite lax, path /, production-only secure, and a 20-minute maxAge. Shared options live in authCookie.ts. Logout clears this cookie after successful session destruction.
- cookie-parser is installed and connected before routes. Express Request is augmented with optional userId. requireAuth reads accessToken, verifies it, sets req.userId, and returns 401 on missing or invalid tokens.
- The student fixed both GET and PATCH /auth/me to read req.userId (not req.session.userId). Both use requireAuth and still query the database to reject missing users. These last two replacements were reviewed and API build passed.
- Migration remains intentionally incomplete: requireAdmin still reads req.session.userId; login still writes the session; logout still destroys it; index.ts still installs express-session and requires SESSION_SECRET. Do not describe JWT migration as finished.
- First next lesson block: migrate administrative routes to requireAuth + requireAdmin in that order, preserve public POST /users before those middleware, change requireAdmin to read req.userId, then remove session setup/assignment/destruction/types/dependencies and the obsolete SESSION_SECRET example. Explain the exact edits for the student to type. Afterward verify the newly migrated JWT HTTP/browser behavior, including no-token/invalid-token responses and USER/ADMIN authorization, plus login/logout and profile access. Existing sessions alone no longer authorize /auth/me; log in again to obtain a JWT cookie. JWT cookie/browser flow has not yet been manually verified.
- Validation: frontend lint/build passed earlier in this conversation; API build passed after the final /me replacements. Isolated runtime checks passed for JWT success, malformed token, wrong key, expiration, missing exp, disallowed algorithm, and invalid ids. Middleware checks passed for valid JWT (userId and next once) and absent/empty/non-string/invalid tokens (401 without next). These checks used a temporary in-memory secret and did not exercise HTTP routes or mutate the database.
- JWT_SECRET is configured in the original local checkout; .env.example has an empty JWT_SECRET entry. Never commit .env or expose secrets. A fresh worktree may lack local .env, dependencies, or the SQLite database; do not confuse that with an application regression.
- Teaching contract: the student writes application code; the assistant explains, reviews, formats, and verifies. The student explicitly wants detailed walkthroughs: exact imports and code snippets in small explained parts, file locations and insertion points, explanations of new lines, syntax, types, parameters, methods, and return values. Give 3–5 related steps per block. Do not implement application code unless explicitly requested. Run checks at meaningful checkpoints.
- WebSocket remains deferred. Do not modify or commit docs/ without a separate request. It is untracked and excluded from this handoff commit.
- This checkpoint supersedes historical next-step suggestions below.

## How To Resume

In a new chat, say:

```txt
Продолжаем урок Volex. Прочитай последний Latest Lesson Checkpoint в LESSON_PROGRESS.md и проверь текущий код. JWT-миграция завершена, эксперимент с истечением токена пройден, срок возвращён на 20m. Добавлен authListener для 401 у выбранных защищённых запросов; build и lint проходят, проверка нового слушателя в браузере ещё не подтверждена. Мы обсудили ограничение ручного списка isAnyOf и общую обёртку над fetchBaseQuery как следующий шаг, но её ещё не реализовали. Сначала объясни общую картину: проблему, цель, роли файлов, полный путь запроса и обработки ошибки, ограничения решения. Только после этого давай код небольшими связанными блоками с подробными объяснениями. Обычно код пишу я, ты проверяешь и форматируешь; просьба реализовать прошлый блок самостоятельно была разовой. Не меняй docs/ и не делай commit/push без запроса.
```

The learning format should stay practical, but use larger task blocks now:

- one practical concept at a time;
- prefer larger lesson blocks: explain the idea briefly, then give 3-5 related tasks;
- avoid spending too much context on tiny one-line changes unless the concept is genuinely new or risky;
- explain what the code means before adding more code;
- provide exact code and imports in explained parts, including file location and line-by-line explanations of new syntax, types, methods, parameters, and return values; the student explicitly requested this detailed walkthrough format;
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

Follow the Latest Lesson Checkpoint above. Authentication, administrative authorization, logout, and shared UI work are complete and manually verified by the student.

Next: implement self-service display-name editing, starting with backend `PATCH /auth/me`, then connect the frontend in a separate practical block. Keep cookie sessions; JWT and WebSocket are deferred.

- The student writes application code; the assistant explains, reviews, and formats.
- Give 3–5 related tasks per block.
- Check new behavior at meaningful checkpoints; do not repeat completed checks.
- Do not modify `docs/` without a separate request.

The completed list and later planning notes below are historical context; they do not override the Latest Lesson Checkpoint.

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
