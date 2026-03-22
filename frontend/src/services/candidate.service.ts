import { Candidate, CreateCandidateDto } from '../types/candidate';

const BASE_URL = 'http://localhost:3010';

async function create(dto: CreateCandidateDto): Promise<Candidate> {
  const formData = new FormData();
  formData.append('firstName', dto.firstName);
  formData.append('lastName', dto.lastName);
  formData.append('email', dto.email);
  if (dto.phone !== undefined) formData.append('phone', dto.phone);
  if (dto.address !== undefined) formData.append('address', dto.address);
  if (dto.education !== undefined) formData.append('education', dto.education);
  if (dto.workExperience !== undefined) formData.append('workExperience', dto.workExperience);
  if (dto.cv !== undefined) formData.append('cv', dto.cv);

  const res = await fetch(`${BASE_URL}/candidates`, {
    method: 'POST',
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

async function getAll(): Promise<Candidate[]> {
  const res = await fetch(`${BASE_URL}/candidates`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al obtener candidatos: ${res.status} ${text}`);
  }

  return res.json() as Promise<Candidate[]>;
}

async function getById(id: number): Promise<Candidate> {
  const res = await fetch(`${BASE_URL}/candidates/${id}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al obtener candidato: ${res.status} ${text}`);
  }

  return res.json() as Promise<Candidate>;
}

export const candidateService = { create, getAll, getById };
