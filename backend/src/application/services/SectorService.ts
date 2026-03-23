import { ISectorRepository } from '../../domain/repositories/ISectorRepository';
import { Sector } from '../../domain/models/Sector';

export class SectorNotFoundError extends Error {
  constructor(id: number) {
    super(`Sector with id ${id} not found`);
    this.name = 'SectorNotFoundError';
  }
}

export class DuplicateSectorNameError extends Error {
  constructor(name: string) {
    super(`Sector name '${name}' is already in use`);
    this.name = 'DuplicateSectorNameError';
  }
}

export class SectorHasJobTypesError extends Error {
  constructor(id: number) {
    super(`Sector ${id} has associated job types and cannot be deleted`);
    this.name = 'SectorHasJobTypesError';
  }
}

export class SectorService {
  constructor(private readonly sectorRepository: ISectorRepository) {}

  async findAll(): Promise<Sector[]> {
    return this.sectorRepository.findAll();
  }

  async findById(id: number): Promise<Sector> {
    const sector = await this.sectorRepository.findById(id);
    if (!sector) throw new SectorNotFoundError(id);
    return sector;
  }

  async create(name: string): Promise<Sector> {
    const existing = await this.sectorRepository.findByName(name);
    if (existing) throw new DuplicateSectorNameError(name);
    return this.sectorRepository.create({ name });
  }

  async update(id: number, name: string): Promise<Sector> {
    const sector = await this.sectorRepository.findById(id);
    if (!sector) throw new SectorNotFoundError(id);

    if (name !== sector.name) {
      const existing = await this.sectorRepository.findByName(name);
      if (existing) throw new DuplicateSectorNameError(name);
    }

    return this.sectorRepository.update(id, { name });
  }

  async delete(id: number): Promise<void> {
    const sector = await this.sectorRepository.findById(id);
    if (!sector) throw new SectorNotFoundError(id);

    const hasJobTypes = await this.sectorRepository.hasJobTypes(id);
    if (hasJobTypes) throw new SectorHasJobTypesError(id);

    await this.sectorRepository.delete(id);
  }
}
