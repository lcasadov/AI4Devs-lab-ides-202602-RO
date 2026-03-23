import { Sector, CreateSectorDto, UpdateSectorDto } from '../models/Sector';

export interface ISectorRepository {
  findAll(): Promise<Sector[]>;
  findById(id: number): Promise<Sector | null>;
  findByName(name: string): Promise<Sector | null>;
  create(dto: CreateSectorDto): Promise<Sector>;
  update(id: number, dto: UpdateSectorDto): Promise<Sector>;
  delete(id: number): Promise<void>;
  hasJobTypes(id: number): Promise<boolean>;
}
