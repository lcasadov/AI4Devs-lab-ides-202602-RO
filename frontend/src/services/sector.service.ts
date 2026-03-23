import { Sector, CreateSectorRequest, UpdateSectorRequest } from '../types/sector.types';
import { authService } from './auth.service';

const BASE_URL = 'http://localhost:3010';

function authHeaders(): Record<string, string> {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token ?? ''}`,
  };
}

async function getAll(): Promise<Sector[]> {
  const res = await fetch(`${BASE_URL}/sectors`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener los sectores');
  return res.json() as Promise<Sector[]>;
}

async function getById(id: number): Promise<Sector> {
  const res = await fetch(`${BASE_URL}/sectors/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al obtener el sector');
  return res.json() as Promise<Sector>;
}

async function create(dto: CreateSectorRequest): Promise<Sector> {
  const res = await fetch(`${BASE_URL}/sectors`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error al crear el sector');
  }
  return res.json() as Promise<Sector>;
}

async function update(id: number, dto: UpdateSectorRequest): Promise<Sector> {
  const res = await fetch(`${BASE_URL}/sectors/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error al actualizar el sector');
  }
  return res.json() as Promise<Sector>;
}

async function deleteSector(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/sectors/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error al eliminar el sector');
  }
}

export const sectorService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteSector,
};
