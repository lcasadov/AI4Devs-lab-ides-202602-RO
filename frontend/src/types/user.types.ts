export interface User {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'RECRUITER';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'RECRUITER';
}

export interface UpdateUserRequest {
  login?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'ADMIN' | 'RECRUITER';
  active?: boolean;
}

export interface UserFilters {
  login?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}
