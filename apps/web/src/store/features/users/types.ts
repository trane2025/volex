export interface User {
  id: number;
  email: string;
  name: string | null;
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
