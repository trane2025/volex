import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../../baseQuery';
import type { User } from '../users/types.ts';
import type { LoginBody, UpdateMeBody } from './types.ts';

export const authQuery = createApi({
  reducerPath: 'auth',
  baseQuery,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<User, LoginBody>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      extraOptions: { skipAuthRevalidation: true },
      invalidatesTags: ['Auth'],
    }),
    getMe: builder.query<User, void>({
      query: () => '/auth/me',
      extraOptions: { skipAuthRevalidation: true },
      providesTags: ['Auth'],
    }),
    updateMe: builder.mutation<User, UpdateMeBody>({
      query: (body) => ({
        url: '/auth/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, error) => (error ? [] : ['Auth']),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      extraOptions: { skipAuthRevalidation: true },
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetMeQuery, useUpdateMeMutation } =
  authQuery;
