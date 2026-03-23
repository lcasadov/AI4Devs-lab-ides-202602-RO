import { IJobTypeRepository } from '../../domain/repositories/IJobTypeRepository';
import { ISectorRepository } from '../../domain/repositories/ISectorRepository';
import { JobType } from '../../domain/models/JobType';

export class JobTypeNotFoundError extends Error {
  constructor(id: number) {
    super(`JobType with id ${id} not found`);
    this.name = 'JobTypeNotFoundError';
  }
}

export class DuplicateJobTypeError extends Error {
  constructor(name: string, sectorId: number) {
    super(`Job type '${name}' already exists in sector ${sectorId}`);
    this.name = 'DuplicateJobTypeError';
  }
}

export class InvalidSectorError extends Error {
  constructor(sectorId: number) {
    super(`Sector with id ${sectorId} does not exist`);
    this.name = 'InvalidSectorError';
  }
}

export interface CreateJobTypeInput {
  name: string;
  sectorId: number;
}

export interface UpdateJobTypeInput {
  name: string;
  sectorId: number;
}

export class JobTypeService {
  constructor(
    private readonly jobTypeRepository: IJobTypeRepository,
    private readonly sectorRepository: ISectorRepository,
  ) {}

  async findAll(filters?: { sectorId?: number }): Promise<JobType[]> {
    return this.jobTypeRepository.findAll(filters);
  }

  async findById(id: number): Promise<JobType> {
    const jobType = await this.jobTypeRepository.findById(id);
    if (!jobType) throw new JobTypeNotFoundError(id);
    return jobType;
  }

  async create(input: CreateJobTypeInput): Promise<JobType> {
    const sector = await this.sectorRepository.findById(input.sectorId);
    if (!sector) throw new InvalidSectorError(input.sectorId);

    const existing = await this.jobTypeRepository.findByNameAndSector(input.name, input.sectorId);
    if (existing) throw new DuplicateJobTypeError(input.name, input.sectorId);

    return this.jobTypeRepository.create({ name: input.name, sectorId: input.sectorId });
  }

  async update(id: number, input: UpdateJobTypeInput): Promise<JobType> {
    const jobType = await this.jobTypeRepository.findById(id);
    if (!jobType) throw new JobTypeNotFoundError(id);

    const sector = await this.sectorRepository.findById(input.sectorId);
    if (!sector) throw new InvalidSectorError(input.sectorId);

    if (input.name !== jobType.name || input.sectorId !== jobType.sectorId) {
      const existing = await this.jobTypeRepository.findByNameAndSector(input.name, input.sectorId);
      if (existing && existing.id !== id) throw new DuplicateJobTypeError(input.name, input.sectorId);
    }

    return this.jobTypeRepository.update(id, { name: input.name, sectorId: input.sectorId });
  }

  async delete(id: number): Promise<void> {
    const jobType = await this.jobTypeRepository.findById(id);
    if (!jobType) throw new JobTypeNotFoundError(id);
    await this.jobTypeRepository.delete(id);
  }
}
