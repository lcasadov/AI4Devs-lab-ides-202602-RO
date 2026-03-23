export interface LoginRequest {
  login: string;
  password: string;
}

export interface AuthUser {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'RECRUITER';
  active: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
