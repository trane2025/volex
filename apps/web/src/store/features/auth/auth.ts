import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { User } from '../users/types.ts';
import type { LoginBody, UpdateMeBody } from './types.ts';

export const authQuery = createApi({
  reducerPath: 'auth',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? '/api',
    credentials: 'include',
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<User, LoginBody>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    getMe: builder.query<User, void>({
      query: () => '/auth/me',
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
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetMeQuery, useUpdateMeMutation } =
  authQuery;
