import { AuthUser, LoginRequest, LoginResponse } from '../types/auth.types';

const BASE_URL = 'http://localhost:3010';
const TOKEN_KEY = 'lti_token';
const USER_KEY = 'lti_user';

async function login(dto: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    throw new Error('Los datos introducidos no son correctos. No tienes acceso.');
  }

  const data = (await res.json()) as LoginResponse;
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data;
}

function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function forgotPassword(userLogin: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: userLogin }),
  });

  if (!res.ok) {
    throw new Error('Error al procesar la solicitud');
  }
}

async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<void> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? ''}`,
    },
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error al cambiar la contraseña');
  }
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export const authService = {
  login,
  logout,
  forgotPassword,
  changePassword,
  getToken,
  getStoredUser,
};
