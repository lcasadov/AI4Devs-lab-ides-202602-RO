import { getPrismaClient } from '../database/prisma-client';
import { ISectorRepository } from '../../domain/repositories/ISectorRepository';
import { Sector, CreateSectorDto, UpdateSectorDto } from '../../domain/models/Sector';

export class SectorRepository implements ISectorRepository {
  async findAll(): Promise<Sector[]> {
    const prisma = getPrismaClient();
    return prisma.sector.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: number): Promise<Sector | null> {
    const prisma = getPrismaClient();
    return prisma.sector.findUnique({ where: { id } });
  }

  async findByName(name: string): Promise<Sector | null> {
    const prisma = getPrismaClient();
    return prisma.sector.findUnique({ where: { name } });
  }

  async create(dto: CreateSectorDto): Promise<Sector> {
    const prisma = getPrismaClient();
    return prisma.sector.create({ data: { name: dto.name } });
  }

  async update(id: number, dto: UpdateSectorDto): Promise<Sector> {
    const prisma = getPrismaClient();
    return prisma.sector.update({ where: { id }, data: { name: dto.name } });
  }

  async delete(id: number): Promise<void> {
    const prisma = getPrismaClient();
    await prisma.sector.delete({ where: { id } });
  }

  async hasJobTypes(id: number): Promise<boolean> {
    const prisma = getPrismaClient();
    const count = await prisma.jobType.count({ where: { sectorId: id } });
    return count > 0;
  }
}
