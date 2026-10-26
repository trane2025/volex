import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import test from 'node:test';

import Database from 'better-sqlite3';
import { SignJWT } from 'jose';

const requireWeb = createRequire(new URL('../../web/package.json', import.meta.url));
const { io } = requireWeb('socket.io-client') as typeof import('socket.io-client');

test('refresh sessions restore access, rotate tokens and respect revocation', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'volex-refresh-'));
  const databasePath = join(directory, 'test.db');
  const db = new Database(databasePath);
  db.pragma('foreign_keys = ON');
  const migrations = new URL('../prisma/migrations/', import.meta.url);

  for (const name of (await readdir(migrations)).sort()) {
    if (name === 'migration_lock.toml') continue;
    db.exec(await readFile(new URL(`${name}/migration.sql`, migrations), 'utf8'));
  }

  const listener = createServer();
  listener.listen(0, '127.0.0.1');
  await once(listener, 'listening');
  const port = (listener.address() as { port: number }).port;
  await new Promise<void>((resolve) => listener.close(() => resolve()));
  const origin = `http://127.0.0.1:${port}`;
  const secret = randomBytes(32).toString('hex');
  const child = spawn(process.execPath, ['--import', 'tsx', 'src/index.ts'], {
    cwd: new URL('..', import.meta.url),
    env: {
      ...process.env,
      DATABASE_URL: `file:${databasePath}`,
      JWT_SECRET: secret,
      PORT: String(port),
      NODE_ENV: 'test',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  t.after(async () => {
    child.kill();
    if (child.exitCode === null && child.signalCode === null) await once(child, 'exit');
    db.close();
    await rm(directory, { recursive: true, force: true });
  });

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('API startup timed out')), 10_000);
    child.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`API exited before startup: ${code}`));
    });
    child.stdout.on('data', (data: Buffer) => {
      if (data.toString().includes('API is running')) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.stderr.on('data', (data: Buffer) => process.stderr.write(data));
  });

  const request = (path: string, method = 'GET', cookie = '', body?: unknown) =>
    fetch(`${origin}${path}`, {
      method,
      headers: { Cookie: cookie, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  const cookies = (response: Response) =>
    response.headers.getSetCookie().map((value) => value.split(';')[0]);
  const tokenFrom = (response: Response, name: string) =>
    cookies(response).find((value) => value.startsWith(`${name}=`))!;
  const login = () =>
    request('/auth/login', 'POST', '', {
      email: 'refresh@example.test',
      password: 'test-password',
    });
  let userId = 0;

  await t.test('login sets both cookies and stores only a refresh-token hash', async () => {
    const registration = await request('/users', 'POST', '', {
      email: 'refresh@example.test',
      password: 'test-password',
      name: 'Refresh test',
    });
    assert.equal(registration.status, 201);
    const response = await login();
    assert.equal(response.status, 200);
    const user = await response.json();
    userId = user.id;
    assert.equal(user.passwordHash, undefined);
    const setCookies = response.headers.getSetCookie();
    assert.match(
      setCookies.find((value) => value.startsWith('accessToken='))!,
      /Max-Age=1200/,
    );
    const refreshCookie = setCookies.find((value) => value.startsWith('refreshToken='))!;
    assert.match(refreshCookie, /HttpOnly/);
    assert.match(refreshCookie, /SameSite=Lax/);
    assert.match(refreshCookie, /Max-Age=60479\d|Max-Age=604800/);
    const token = tokenFrom(response, 'refreshToken').split('=')[1];
    const row = db.prepare('SELECT tokenHash FROM RefreshSession WHERE userId = ?').get(userId) as {
      tokenHash: string;
    };
    assert.notEqual(row.tokenHash, token);
    assert.equal(row.tokenHash, createHash('sha256').update(token).digest('hex'));
  });

  await t.test(
    'expired access is restored; refresh rotates without extending session expiry',
    async () => {
      const response = await login();
      const refreshCookie = tokenFrom(response, 'refreshToken');
      const expiry = db
        .prepare('SELECT expiresAt FROM RefreshSession ORDER BY createdAt DESC LIMIT 1')
        .get() as { expiresAt: number };
      const expiredAccess = await new SignJWT({})
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(String(userId))
        .setIssuedAt()
        .setExpirationTime('0s')
        .sign(new TextEncoder().encode(secret));
      assert.equal((await request('/auth/me', 'GET', `accessToken=${expiredAccess}`)).status, 401);
      const refreshed = await request('/auth/refresh', 'POST', refreshCookie);
      assert.equal(refreshed.status, 204);
      assert.equal(refreshed.headers.get('cache-control'), 'no-store');
      assert.notEqual(tokenFrom(refreshed, 'refreshToken'), refreshCookie);
      const me = await request('/auth/me', 'GET', tokenFrom(refreshed, 'accessToken'));
      assert.equal(me.status, 200);
      assert.equal((await me.json()).id, userId);
      const newHash = createHash('sha256')
        .update(tokenFrom(refreshed, 'refreshToken').split('=')[1])
        .digest('hex');
      assert.deepEqual(
        db.prepare('SELECT expiresAt FROM RefreshSession WHERE tokenHash = ?').get(newHash),
        expiry,
      );
      assert.equal((await request('/auth/refresh', 'POST', refreshCookie)).status, 401);
    },
  );

  await t.test('parallel reuse of one refresh token succeeds only once', async () => {
    const response = await login();
    const cookie = tokenFrom(response, 'refreshToken');
    const responses = await Promise.all([
      request('/auth/refresh', 'POST', cookie),
      request('/auth/refresh', 'POST', cookie),
    ]);
    assert.deepEqual(responses.map((value) => value.status).sort(), [204, 401]);
  });

  await t.test('logout revokes only the current session and clears both cookies', async () => {
    const first = await login();
    const second = await login();
    const cookie = tokenFrom(first, 'refreshToken');
    const logout = await request('/auth/logout', 'POST', cookie);
    assert.equal(logout.status, 204);
    assert.equal(cookies(logout).length, 2);
    assert.ok(
      logout.headers.getSetCookie().every((value) => value.includes('Expires=Thu, 01 Jan 1970')),
    );
    assert.equal((await request('/auth/refresh', 'POST', cookie)).status, 401);
    assert.equal(
      (await request('/auth/refresh', 'POST', tokenFrom(second, 'refreshToken'))).status,
      204,
    );
  });

  await t.test('missing, malformed, expired and deleted-user sessions cannot refresh', async () => {
    assert.equal((await request('/auth/refresh', 'POST')).status, 401);
    assert.equal((await request('/auth/refresh', 'POST', 'refreshToken=invalid')).status, 401);
    const expired = await login();
    db.prepare('UPDATE RefreshSession SET expiresAt = ?').run(Date.now() - 1000);
    assert.equal(
      (await request('/auth/refresh', 'POST', tokenFrom(expired, 'refreshToken'))).status,
      401,
    );
    const deleted = await login();
    db.prepare('DELETE FROM User WHERE id = ?').run(userId);
    assert.equal(
      (await request('/auth/refresh', 'POST', tokenFrom(deleted, 'refreshToken'))).status,
      401,
    );
    assert.equal(
      (db.prepare('SELECT count(*) AS total FROM RefreshSession').get() as { total: number }).total,
      0,
    );
  });

  await t.test(
    'socket rejects missing access with a code and accepts access obtained by refresh',
    async () => {
      await request('/users', 'POST', '', {
        email: 'refresh@example.test',
        password: 'test-password',
      });
      const response = await login();
      const refreshed = await request('/auth/refresh', 'POST', tokenFrom(response, 'refreshToken'));
      const connect = (cookie: string) =>
        new Promise<string>((resolve, reject) => {
          const socket = io(origin, {
            transports: ['websocket'],
            reconnection: false,
            timeout: 3000,
            extraHeaders: { Cookie: cookie },
          });
          socket.on('connect', () => {
            socket.disconnect();
            resolve('connected');
          });
          socket.on('connect_error', (error: Error & { data?: { code?: string } }) => {
            socket.disconnect();
            if (error.data?.code) resolve(error.data.code);
            else reject(error);
          });
        });
      assert.equal(await connect(''), 'UNAUTHORIZED');
      assert.equal(await connect(tokenFrom(refreshed, 'accessToken')), 'connected');
    },
  );
});
