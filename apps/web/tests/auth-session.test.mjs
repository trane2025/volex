import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';

test(
  'HTTP authentication refreshes once and preserves recoverable failures',
  { timeout: 10_000 },
  async (t) => {
    const previousApiUrl = process.env.VITE_API_URL;
    process.env.VITE_API_URL = 'http://volex.test/api';
    const server = await createServer({
      configFile: false,
      server: { middlewareMode: true, hmr: false, ws: false },
      optimizeDeps: { noDiscovery: true, include: [] },
    });
    const originalFetch = globalThis.fetch;
    t.after(async () => {
      globalThis.fetch = originalFetch;
      if (previousApiUrl === undefined) delete process.env.VITE_API_URL;
      else process.env.VITE_API_URL = previousApiUrl;
      await server.close();
    });

    const { baseQuery } = await server.ssrLoadModule('/src/store/baseQuery.ts');
    const actions = [];
    const api = {
      signal: new AbortController().signal,
      dispatch: (action) => actions.push(action),
      getState: () => ({}),
      extra: undefined,
      endpoint: 'test',
      type: 'query',
    };
    const json = (body, status = 200) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });

    await t.test(
      'concurrent 401 requests share refresh and repeat their original method/body',
      async () => {
        actions.length = 0;
        const attempts = new Map();
        let refreshes = 0;
        let releaseRefresh;
        const barrier = new Promise((resolve) => {
          releaseRefresh = resolve;
        });
        globalThis.fetch = async (input, options) => {
          const url = typeof input === 'string' ? input : input.url;
          if (url.endsWith('/auth/refresh')) {
            refreshes++;
            assert.equal(options.credentials, 'include');
            await barrier;
            return new Response(null, { status: 204 });
          }
          assert.equal(input.credentials, 'include');
          assert.equal(input.method, 'PATCH');
          assert.deepEqual(await input.clone().json(), { name: 'Updated' });
          const count = (attempts.get(url) ?? 0) + 1;
          attempts.set(url, count);
          return count === 1 ? json({}, 401) : json({ ok: true });
        };
        const first = baseQuery(
          { url: '/first', method: 'PATCH', body: { name: 'Updated' } },
          api,
          {},
        );
        const second = baseQuery(
          { url: '/second', method: 'PATCH', body: { name: 'Updated' } },
          api,
          {},
        );
        // Let both original requests reach their 401 response before completing refresh.
        while (!refreshes || attempts.size !== 2) await new Promise(setImmediate);
        assert.equal(refreshes, 1);
        releaseRefresh();
        assert.deepEqual(
          (await Promise.all([first, second])).map((result) => result.data),
          [{ ok: true }, { ok: true }],
        );
        assert.equal(refreshes, 1);
        assert.deepEqual([...attempts.values()], [2, 2]);
        assert.equal(actions.length, 0);
      },
    );

    await t.test('failed refresh keeps temporary errors distinct from unauthorized', async () => {
      for (const status of [401, 503]) {
        actions.length = 0;
        globalThis.fetch = async (input) => {
          const url = typeof input === 'string' ? input : input.url;
          return json({}, url.endsWith('/auth/refresh') ? status : 401);
        };
        const result = await baseQuery('/protected', api, {});
        assert.equal(result.error.status, status === 401 ? 401 : 'FETCH_ERROR');
        assert.equal(actions.length, status === 401 ? 1 : 0);
      }
    });

    await t.test('a second unauthorized response is final; no endless refresh loop', async () => {
      actions.length = 0;
      let refreshes = 0;
      globalThis.fetch = async (input) => {
        const url = typeof input === 'string' ? input : input.url;
        if (url.endsWith('/auth/refresh')) {
          refreshes++;
          return new Response(null, { status: 204 });
        }
        return json({}, 401);
      };
      assert.equal((await baseQuery('/protected', api, {})).error.status, 401);
      assert.equal(refreshes, 1);
      assert.equal(actions.length, 1);
    });

    await t.test('wrong-password login does not attempt refresh', async () => {
      actions.length = 0;
      let calls = 0;
      globalThis.fetch = async () => {
        calls++;
        return json({}, 401);
      };
      const result = await baseQuery('/auth/login', api, {
        changesAuthSession: true,
        skipRefresh: true,
        skipAuthRevalidation: true,
      });
      assert.equal(result.error.status, 401);
      assert.equal(calls, 1);
      assert.equal(actions.length, 0);
    });

    await t.test('login/logout wait for a pending refresh cookie change', async () => {
      const calls = [];
      let releaseRefresh;
      const barrier = new Promise((resolve) => {
        releaseRefresh = resolve;
      });
      let attempts = 0;
      globalThis.fetch = async (input) => {
        const url = typeof input === 'string' ? input : input.url;
        calls.push(url);
        if (url.endsWith('/auth/refresh')) {
          await barrier;
          return new Response(null, { status: 204 });
        }
        if (url.endsWith('/protected')) return json({}, ++attempts === 1 ? 401 : 200);
        return new Response(null, { status: 204 });
      };
      const protectedRequest = baseQuery('/protected', api, {});
      while (!calls.some((url) => url.endsWith('/auth/refresh'))) await new Promise(setImmediate);
      const logout = baseQuery({ url: '/auth/logout', method: 'POST' }, api, {
        changesAuthSession: true,
        skipRefresh: true,
        skipAuthRevalidation: true,
      });
      await new Promise(setImmediate);
      assert.equal(
        calls.some((url) => url.endsWith('/auth/logout')),
        false,
      );
      releaseRefresh();
      await Promise.all([protectedRequest, logout]);
      assert.ok(calls.some((url) => url.endsWith('/auth/logout')));
    });

    await t.test(
      'ProtectedRoute offers retry on initial API failure and keeps an existing messenger mounted',
      async () => {
        const { ProtectedRoute } = await server.ssrLoadModule(
          '/src/components/ProtectedRoute/ProtectedRoute.tsx',
        );
        const { setupStore } = await server.ssrLoadModule('/src/store/index.ts');
        const { authQuery } = await server.ssrLoadModule('/src/store/features/auth/auth.ts');
        const store = setupStore();
        const render = () =>
          renderToStaticMarkup(
            createElement(
              Provider,
              { store },
              createElement(
                MemoryRouter,
                null,
                createElement(
                  ProtectedRoute,
                  null,
                  createElement('span', null, 'messenger content'),
                ),
              ),
            ),
          );
        globalThis.fetch = async () => json({}, 503);
        const initial = store.dispatch(authQuery.endpoints.getMe.initiate());
        await initial;
        assert.match(render(), /Не удалось проверить вход/);
        assert.match(render(), /Повторить/);

        globalThis.fetch = async () => json({ id: 1, email: 'test@example.test', role: 'USER' });
        await initial.refetch();
        assert.match(render(), /messenger content/);

        globalThis.fetch = async () => json({}, 503);
        await initial.refetch();
        assert.match(render(), /messenger content/);

        globalThis.fetch = async () => json({}, 401);
        await initial.refetch();
        assert.doesNotMatch(render(), /messenger content/);
        initial.unsubscribe();
        store.dispatch(authQuery.util.resetApiState());
      },
    );
  },
);
