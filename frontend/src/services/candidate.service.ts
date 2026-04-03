import { Candidate, CreateCandidateFormData, UpdateCandidateData } from '../types/candidate';

const BASE_URL = process.env['REACT_APP_API_URL'] ?? 'http://localhost:3010';

async function getAll(): Promise<Candidate[]> {
  const res = await fetch(`${BASE_URL}/candidates`, { credentials: 'include' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al obtener candidatos: ${res.status} ${text}`);
  }
  return res.json() as Promise<Candidate[]>;
}

async function getById(id: number): Promise<Candidate> {
  const res = await fetch(`${BASE_URL}/candidates/${id}`, { credentials: 'include' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al obtener candidato: ${res.status} ${text}`);
  }
  return res.json() as Promise<Candidate>;
}

async function create(data: CreateCandidateFormData): Promise<Candidate> {
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
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 409) throw new Error('Este email ya está registrado');
    const text = await res.text();
    throw new Error(`Error al crear candidato: ${res.status} ${text}`);
  }

  return res.json() as Promise<Candidate>;
}

async function update(id: number, data: UpdateCandidateData): Promise<Candidate> {
  const payload = {
    ...data,
    ...(data.education !== undefined && { education: JSON.stringify(data.education) }),
    ...(data.workExperience !== undefined && { workExperience: JSON.stringify(data.workExperience) }),
  };

  const res = await fetch(`${BASE_URL}/candidates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Candidato no encontrado');
    if (res.status === 409) throw new Error('Este email ya está registrado');
    const text = await res.text();
    throw new Error(`Error al actualizar candidato: ${res.status} ${text}`);
  }

  return res.json() as Promise<Candidate>;
}

async function uploadCv(id: number, file: File): Promise<Candidate> {
  const formData = new FormData();
  formData.append('cv', file);

  const res = await fetch(`${BASE_URL}/candidates/${id}/cv`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Candidato no encontrado');
    const text = await res.text();
    throw new Error(`Error al subir CV: ${res.status} ${text}`);
  }

  return res.json() as Promise<Candidate>;
}

async function deleteCandidate(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/candidates/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Candidato no encontrado');
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
