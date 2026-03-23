import { Request, Response } from 'express';
import { z } from 'zod';
import {
  SectorService,
  SectorNotFoundError,
  DuplicateSectorNameError,
  SectorHasJobTypesError,
} from '../../application/services/SectorService';
import { SectorRepository } from '../../infrastructure/repositories/SectorRepository';

function getSectorService(): SectorService {
  return new SectorService(new SectorRepository());
}

const sectorSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function getAll(_req: Request, res: Response): Promise<void> {
  try {
    const service = getSectorService();
    const sectors = await service.findAll();
    res.status(200).json(sectors);
  } catch (err: unknown) {
    console.error('Get all sectors error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid sector ID' });
    return;
  }
  try {
    const service = getSectorService();
    const sector = await service.findById(id);
    res.status(200).json(sector);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'SectorNotFoundError') {
      res.status(404).json({ error: err.message });
      return;
    }
    console.error('Get sector by id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  const parsed = sectorSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body', details: parsed.error.errors });
    return;
  }
  try {
    const service = getSectorService();
    const sector = await service.create(parsed.data.name);
    res.status(201).json(sector);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'DuplicateSectorNameError') {
      res.status(409).json({ error: err.message });
      return;
    }
    console.error('Create sector error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid sector ID' });
    return;
  }
  const parsed = sectorSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body', details: parsed.error.errors });
    return;
  }
  try {
    const service = getSectorService();
    const sector = await service.update(id, parsed.data.name);
    res.status(200).json(sector);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'SectorNotFoundError') {
      res.status(404).json({ error: err.message });
      return;
    }
    if (err instanceof Error && err.name === 'DuplicateSectorNameError') {
      res.status(409).json({ error: err.message });
      return;
    }
    console.error('Update sector error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteSector(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid sector ID' });
    return;
  }
  try {
    const service = getSectorService();
    await service.delete(id);
    res.status(204).send();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'SectorNotFoundError') {
      res.status(404).json({ error: err.message });
      return;
    }
    if (err instanceof Error && err.name === 'SectorHasJobTypesError') {
      res.status(409).json({ error: err.message });
      return;
    }
    console.error('Delete sector error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
