import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query';
import { authUnauthorized } from './features/auth/authEvents';
import { apiBaseUrl, refreshAccessToken, withAuthSessionLock } from './features/auth/authSession';

type AuthExtraOptions = {
  skipAuthRevalidation?: boolean;
  skipRefresh?: boolean;
  changesAuthSession?: boolean;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  credentials: 'include',
});

export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  AuthExtraOptions,
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  if (extraOptions?.changesAuthSession) {
    return withAuthSessionLock(async () => rawBaseQuery(args, api, extraOptions));
  }

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && !extraOptions?.skipRefresh) {
    const refreshResult = await refreshAccessToken();

    if (api.signal.aborted) return result;

    if (refreshResult === 'refreshed') {
      result = await rawBaseQuery(args, api, extraOptions);
    } else if (refreshResult === 'unavailable') {
      return {
        error: { status: 'FETCH_ERROR', error: 'Не удалось продлить вход. Попробуйте ещё раз' },
      };
    }
  }

  if (result.error?.status === 401 && !extraOptions?.skipAuthRevalidation) {
    api.dispatch(authUnauthorized());
  }

  return result;
};
