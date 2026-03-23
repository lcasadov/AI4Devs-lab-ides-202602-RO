export type Role = 'ADMIN' | 'RECRUITER';

export interface User {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
// Note: passwordHash is NOT in the User interface (never returned)

export interface CreateUserDto {
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export interface UpdateUserDto {
  login?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: Role;
  active?: boolean;
}
