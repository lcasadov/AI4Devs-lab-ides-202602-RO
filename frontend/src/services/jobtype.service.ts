import { JobType, CreateJobTypeRequest, UpdateJobTypeRequest, JobTypeFilters } from '../types/jobtype.types';

const BASE_URL = process.env['REACT_APP_API_URL'] ?? 'http://localhost:3010';

async function getAll(filters?: Pick<JobTypeFilters, 'sectorId'>): Promise<JobType[]> {
  const params = new URLSearchParams();
  if (filters?.sectorId !== undefined) params.set('sectorId', String(filters.sectorId));
  const query = params.toString();
  const url = `${BASE_URL}/jobtypes${query ? `?${query}` : ''}`;
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Error al obtener los tipos de puesto');
  return res.json() as Promise<JobType[]>;
}

async function getById(id: number): Promise<JobType> {
  const res = await fetch(`${BASE_URL}/jobtypes/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Error al obtener el tipo de puesto');
  return res.json() as Promise<JobType>;
}

async function create(dto: CreateJobTypeRequest): Promise<JobType> {
  const res = await fetch(`${BASE_URL}/jobtypes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error al crear el tipo de puesto');
  }
  return res.json() as Promise<JobType>;
}

async function update(id: number, dto: UpdateJobTypeRequest): Promise<JobType> {
  const res = await fetch(`${BASE_URL}/jobtypes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error al actualizar el tipo de puesto');
  }
  return res.json() as Promise<JobType>;
}

async function deleteJobType(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/jobtypes/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Error al eliminar el tipo de puesto');
  }
}

export const jobtypeService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteJobType,
};
