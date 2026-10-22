import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query';
import { authUnauthorized } from './features/auth/authEvents';

type AuthExtraOptions = {
  skipAuthRevalidation?: boolean;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL ?? '/api',
  credentials: 'include',
});

export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  AuthExtraOptions,
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && !extraOptions?.skipAuthRevalidation) {
    api.dispatch(authUnauthorized());
  }

  return result;
};
