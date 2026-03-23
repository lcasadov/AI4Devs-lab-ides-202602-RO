import { getPrismaClient } from '../database/prisma-client';
import { IJobTypeRepository } from '../../domain/repositories/IJobTypeRepository';
import { JobType, CreateJobTypeDto, UpdateJobTypeDto } from '../../domain/models/JobType';

export class JobTypeRepository implements IJobTypeRepository {
  async findAll(filters?: { sectorId?: number }): Promise<JobType[]> {
    const prisma = getPrismaClient();
    return prisma.jobType.findMany({
      where: filters?.sectorId !== undefined ? { sectorId: filters.sectorId } : undefined,
      include: { sector: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number): Promise<JobType | null> {
    const prisma = getPrismaClient();
    return prisma.jobType.findUnique({
      where: { id },
      include: { sector: { select: { id: true, name: true } } },
    });
  }

  async findByNameAndSector(name: string, sectorId: number): Promise<JobType | null> {
    const prisma = getPrismaClient();
    return prisma.jobType.findUnique({
      where: { name_sectorId: { name, sectorId } },
      include: { sector: { select: { id: true, name: true } } },
    });
  }

  async create(dto: CreateJobTypeDto): Promise<JobType> {
    const prisma = getPrismaClient();
    return prisma.jobType.create({
      data: { name: dto.name, sectorId: dto.sectorId },
      include: { sector: { select: { id: true, name: true } } },
    });
  }

  async update(id: number, dto: UpdateJobTypeDto): Promise<JobType> {
    const prisma = getPrismaClient();
    return prisma.jobType.update({
      where: { id },
      data: { name: dto.name, sectorId: dto.sectorId },
      include: { sector: { select: { id: true, name: true } } },
    });
  }

  async delete(id: number): Promise<void> {
    const prisma = getPrismaClient();
    await prisma.jobType.delete({ where: { id } });
  }
}
