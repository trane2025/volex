import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../../baseQuery';
import type { CreateUserBody, UpdateUserRequest, User } from './types.ts';

export const usersQuery = createApi({
  reducerPath: 'users',
  baseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      transformResponse: (response: User[]) => response ?? [],
      providesTags: (users) =>
        users
          ? [
              ...users.map((user) => ({ type: 'User' as const, id: user.id })),
              { type: 'User' as const, id: 'LIST' },
            ]
          : [{ type: 'User' as const, id: 'LIST' }],
    }),
    createUser: builder.mutation<User, CreateUserBody>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      extraOptions: { skipAuthRevalidation: true, skipRefresh: true },
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    updateUser: builder.mutation<User, UpdateUserRequest>({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useDeleteUserMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
} = usersQuery;
