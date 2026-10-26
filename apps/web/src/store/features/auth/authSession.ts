export const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

type RefreshResult = 'refreshed' | 'unauthorized' | 'unavailable';

let refreshPromise: Promise<RefreshResult> | undefined;
let authQueue: Promise<void> = Promise.resolve();

// Serialize cookie changes, including between tabs when Web Locks are available.
export const withAuthSessionLock = <T>(action: () => Promise<T>): Promise<T> => {
  const run = () =>
    typeof navigator !== 'undefined' && navigator.locks
      ? navigator.locks.request('volex-auth-session', action)
      : action();
  const result = authQueue.then(run, run);
  authQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
};

export const refreshAccessToken = (): Promise<RefreshResult> => {
  if (!refreshPromise) {
    refreshPromise = withAuthSessionLock(async (): Promise<RefreshResult> => {
      try {
        const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          signal: AbortSignal.timeout(10_000),
        });

        if (response.ok) return 'refreshed';
        return response.status === 401 ? 'unauthorized' : 'unavailable';
      } catch {
        return 'unavailable';
      }
    }).finally(() => {
      refreshPromise = undefined;
    });
  }

  return refreshPromise;
};
