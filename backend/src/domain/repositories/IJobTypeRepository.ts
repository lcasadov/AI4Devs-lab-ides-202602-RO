import { JobType, CreateJobTypeDto, UpdateJobTypeDto } from '../models/JobType';

export interface IJobTypeRepository {
  findAll(filters?: { sectorId?: number }): Promise<JobType[]>;
  findById(id: number): Promise<JobType | null>;
  findByNameAndSector(name: string, sectorId: number): Promise<JobType | null>;
  create(dto: CreateJobTypeDto): Promise<JobType>;
  update(id: number, dto: UpdateJobTypeDto): Promise<JobType>;
  delete(id: number): Promise<void>;
}
