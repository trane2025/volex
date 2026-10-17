export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserBody {
  email: string;
  name?: string;
  password: string;
}

export interface UpdateUserBody {
  email?: string;
  name?: string;
}

export interface UpdateUserRequest {
  id: number;
  body: UpdateUserBody;
}
