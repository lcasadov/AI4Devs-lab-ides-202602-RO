export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
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
  education?: unknown;
  workExperience?: unknown;
  cvFileName?: string;
}
