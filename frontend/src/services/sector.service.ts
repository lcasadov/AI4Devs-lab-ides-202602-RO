import { Sector, CreateSectorRequest, UpdateSectorRequest } from '../types/sector.types';

const BASE_URL = process.env['REACT_APP_API_URL'] ?? 'http://localhost:3010';

async function getAll(): Promise<Sector[]> {
  const res = await fetch(`${BASE_URL}/sectors`, { credentials: 'include' });
  if (!res.ok) throw new Error('Error al obtener los sectores');
  return res.json() as Promise<Sector[]>;
}

async function getById(id: number): Promise<Sector> {
  const res = await fetch(`${BASE_URL}/sectors/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Error al obtener el sector');
  return res.json() as Promise<Sector>;
}

async function create(dto: CreateSectorRequest): Promise<Sector> {
  const res = await fetch(`${BASE_URL}/sectors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
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
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
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
    credentials: 'include',
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
