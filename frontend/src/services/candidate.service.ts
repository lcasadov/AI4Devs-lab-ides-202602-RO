import { authService } from './auth.service';
import { Candidate, CreateCandidateFormData, UpdateCandidateData } from '../types/candidate';

const BASE_URL = process.env['REACT_APP_API_URL'] ?? 'http://localhost:3010';

function authBearerHeaders(): Record<string, string> {
  const token = authService.getToken();
  return {
    Authorization: `Bearer ${token ?? ''}`,
  };
}

function authJsonHeaders(): Record<string, string> {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token ?? ''}`,
  };
}

async function getAll(token?: string): Promise<Candidate[]> {
  const headers: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : authBearerHeaders();
  const res = await fetch(`${BASE_URL}/candidates`, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al obtener candidatos: ${res.status} ${text}`);
  }
  return res.json() as Promise<Candidate[]>;
}

async function getById(id: number, token?: string): Promise<Candidate> {
  const headers: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : authBearerHeaders();
  const res = await fetch(`${BASE_URL}/candidates/${id}`, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al obtener candidato: ${res.status} ${text}`);
  }
  return res.json() as Promise<Candidate>;
}

async function create(data: CreateCandidateFormData, token?: string): Promise<Candidate> {
  const headers: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : authBearerHeaders();

  const formData = new FormData();
  formData.append('firstName', data.firstName);
  formData.append('lastName', data.lastName);
  formData.append('email', data.email);
  if (data.phone !== undefined) formData.append('phone', data.phone);
  if (data.address !== undefined) formData.append('address', data.address);
  if (data.postalCode !== undefined) formData.append('postalCode', data.postalCode);
  if (data.province !== undefined) formData.append('province', data.province);
  if (data.municipality !== undefined) formData.append('municipality', data.municipality);
  if (data.sectorId !== undefined) formData.append('sectorId', String(data.sectorId));
  if (data.jobTypeId !== undefined) formData.append('jobTypeId', String(data.jobTypeId));
  if (data.education !== undefined) formData.append('education', JSON.stringify(data.education));
  if (data.workExperience !== undefined) formData.append('workExperience', JSON.stringify(data.workExperience));
  if (data.cv !== undefined) formData.append('cv', data.cv);

  const res = await fetch(`${BASE_URL}/candidates`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 409) {
      throw new Error('Este email ya está registrado');
    }
    const text = await res.text();
    throw new Error(`Error al crear candidato: ${res.status} ${text}`);
  }

  return res.json() as Promise<Candidate>;
}

async function update(id: number, data: UpdateCandidateData, token?: string): Promise<Candidate> {
  const headers: Record<string, string> = token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : authJsonHeaders();

  const res = await fetch(`${BASE_URL}/candidates/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Candidato no encontrado');
    }
    if (res.status === 409) {
      throw new Error('Este email ya está registrado');
    }
    const text = await res.text();
    throw new Error(`Error al actualizar candidato: ${res.status} ${text}`);
  }

  return res.json() as Promise<Candidate>;
}

async function uploadCv(id: number, file: File, token?: string): Promise<Candidate> {
  const headers: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : authBearerHeaders();

  const formData = new FormData();
  formData.append('cv', file);

  const res = await fetch(`${BASE_URL}/candidates/${id}/cv`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Candidato no encontrado');
    }
    const text = await res.text();
    throw new Error(`Error al subir CV: ${res.status} ${text}`);
  }

  return res.json() as Promise<Candidate>;
}

async function deleteCandidate(id: number, token?: string): Promise<void> {
  const headers: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : authBearerHeaders();

  const res = await fetch(`${BASE_URL}/candidates/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Candidato no encontrado');
    }
    const text = await res.text();
    throw new Error(`Error al eliminar candidato: ${res.status} ${text}`);
  }
}

export const candidateService = {
  getAll,
  getById,
  create,
  update,
  uploadCv,
  delete: deleteCandidate,
};
