import { CreateUserRequest, UpdateUserRequest, User, UserFilters } from '../types/user.types';

const BASE_URL = process.env['REACT_APP_API_URL'] ?? 'http://localhost:3010';

async function getAll(filters?: UserFilters): Promise<User[]> {
  const params = new URLSearchParams();
  if (filters?.login) params.set('login', filters.login);
  if (filters?.firstName) params.set('firstName', filters.firstName);
  if (filters?.lastName) params.set('lastName', filters.lastName);
  if (filters?.email) params.set('email', filters.email);
  if (filters?.role) params.set('role', filters.role);

  const query = params.toString();
  const url = `${BASE_URL}/users${query ? `?${query}` : ''}`;

  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Error al obtener los usuarios');
  return res.json() as Promise<User[]>;
}

async function getById(id: number): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Error al obtener el usuario');
  return res.json() as Promise<User>;
}

async function create(dto: CreateUserRequest): Promise<User> {
  const res = await fetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error al crear el usuario');
  }
  return res.json() as Promise<User>;
}

async function update(id: number, dto: UpdateUserRequest): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error al actualizar el usuario');
  }
  return res.json() as Promise<User>;
}

async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al eliminar el usuario');
}

async function resetPassword(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/users/${id}/reset-password`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al resetear la contraseña');
}

export const userService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteUser,
  resetPassword,
};
