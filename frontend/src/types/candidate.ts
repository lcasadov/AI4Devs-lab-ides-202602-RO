export interface EducationEntry {
  institution: string;
  degree: string;
  startYear: string;
  endYear: string;
}

export interface WorkExperienceEntry {
  company: string;
  position: string;
  startYear: string;
  endYear: string;
  description: string;
}

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
  sector?: { id: number; name: string } | null;
  jobType?: { id: number; name: string } | null;
  education?: EducationEntry[] | null;
  workExperience?: WorkExperienceEntry[] | null;
  cvFileName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateFormData {
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
  education?: EducationEntry[];
  workExperience?: WorkExperienceEntry[];
  cv?: File;
}

export interface UpdateCandidateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  province?: string;
  municipality?: string;
  sectorId?: number | null;
  jobTypeId?: number | null;
  education?: EducationEntry[];
  workExperience?: WorkExperienceEntry[];
}
