export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  province?: string;
  municipality?: string;
  sectorId?: number;
  jobTypeId?: number;
  sector?: { id: number; name: string };
  jobType?: { id: number; name: string };
  education?: unknown;
  workExperience?: unknown;
  cvFileName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCandidateDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  province?: string;
  municipality?: string;
  sectorId?: number;
  jobTypeId?: number;
  education?: unknown;
  workExperience?: unknown;
  cvFileName?: string;
}

export interface UpdateCandidateDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  province?: string;
  municipality?: string;
  sectorId?: number;
  jobTypeId?: number;
  education?: unknown;
  workExperience?: unknown;
  cvFileName?: string;
}
