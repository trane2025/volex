import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { User } from './types.ts';

export const usersQuery = createApi({
  reducerPath: 'users',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? '/api',
  }),
  // tagTypes - список названий кеш-тегов, которые может использовать этот API.
  // Здесь мы говорим RTK Query: "у нас есть данные типа User".
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      transformResponse: (response: User[]) => response ?? [],
      // providesTags описывает, какие кеш-теги появились после GET /users.
      // RTK Query запоминает: "этот результат запроса связан с такими User-тегами".
      providesTags: (users) =>
        users
          ? [
              // Отдельный тег для каждого пользователя.
              // Например: { type: 'User', id: 5 }.
              ...users.map((user) => ({ type: 'User' as const, id: user.id })),
              // Общий тег для всего списка пользователей.
              // Он нужен, когда меняется не один объект в кеше, а сам список.
              { type: 'User' as const, id: 'LIST' },
            ]
          : // Даже если пользователей нет, тег списка всё равно нужен.
            // Иначе после создания/удаления RTK Query не будет знать, какой список обновлять.
            [{ type: 'User' as const, id: 'LIST' }],
    }),
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      // invalidatesTags говорит: "после DELETE эти кеш-теги устарели".
      // Если на экране есть активный useGetUsersQuery(), RTK Query сам перезапросит данные.
      invalidatesTags: (_result, _error, id) => [
        // Устарел конкретный удаленный пользователь.
        { type: 'User', id },
        // Устарел весь список, потому что в нем стало на одного пользователя меньше.
        { type: 'User', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetUsersQuery, useDeleteUserMutation } = usersQuery;
