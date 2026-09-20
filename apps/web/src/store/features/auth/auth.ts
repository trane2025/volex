import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { User } from '../users/types.ts';
import type { LoginBody } from './types.ts';

export const authQuery = createApi({
  reducerPath: 'auth',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? '/api',
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    login: builder.mutation<User, LoginBody>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    getMe: builder.query<User, void>({
      query: () => '/auth/me',
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetMeQuery } = authQuery;
