export interface JobType {
  id: number;
  name: string;
  sectorId: number;
  sector?: { id: number; name: string };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateJobTypeDto {
  name: string;
  sectorId: number;
}

export interface UpdateJobTypeDto {
  name: string;
  sectorId: number;
}
