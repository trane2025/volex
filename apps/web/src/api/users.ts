import { apiClient } from './client.ts';

export type User = {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserBody = {
  email: string;
  name?: string;
};

export type UpdateUserBody = Partial<CreateUserBody>;

export const usersApi = {
  getAll: () => {
    return apiClient.get<User[]>('/users');
  },

  getById: (id: number) => {
    return apiClient.get<User>(`/users/${id}`);
  },

  create: (body: CreateUserBody) => {
    return apiClient.post<User, CreateUserBody>('/users', body);
  },

  update: (id: number, body: UpdateUserBody) => {
    return apiClient.patch<User, UpdateUserBody>(`/users/${id}`, body);
  },

  delete: (id: number) => {
    return apiClient.delete<User>(`/users/${id}`);
  },
};
