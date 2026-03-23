export interface JobType {
  id: number;
  name: string;
  sectorId: number;
  sector: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobTypeRequest {
  name: string;
  sectorId: number;
}

export interface UpdateJobTypeRequest {
  name: string;
  sectorId: number;
}

export interface JobTypeFilters {
  name?: string;
  sectorId?: number;
}
