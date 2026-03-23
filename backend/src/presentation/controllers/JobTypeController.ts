import { Request, Response } from 'express';
import { z } from 'zod';
import {
  JobTypeService,
  JobTypeNotFoundError,
  DuplicateJobTypeError,
  InvalidSectorError,
} from '../../application/services/JobTypeService';
import { JobTypeRepository } from '../../infrastructure/repositories/JobTypeRepository';
import { SectorRepository } from '../../infrastructure/repositories/SectorRepository';

function getJobTypeService(): JobTypeService {
  return new JobTypeService(new JobTypeRepository(), new SectorRepository());
}

const jobTypeSchema = z.object({
  name: z.string().min(1).max(100),
  sectorId: z.number().int().positive(),
});

export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const sectorIdRaw = req.query['sectorId'];
    const filters =
      typeof sectorIdRaw === 'string' && sectorIdRaw !== ''
        ? { sectorId: parseInt(sectorIdRaw, 10) }
        : undefined;

    if (filters?.sectorId !== undefined && isNaN(filters.sectorId)) {
      res.status(400).json({ error: 'Invalid sectorId query parameter' });
      return;
    }

    const service = getJobTypeService();
    const jobTypes = await service.findAll(filters);
    res.status(200).json(jobTypes);
  } catch (err: unknown) {
    console.error('Get all job types error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid job type ID' });
    return;
  }
  try {
    const service = getJobTypeService();
    const jobType = await service.findById(id);
    res.status(200).json(jobType);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'JobTypeNotFoundError') {
      res.status(404).json({ error: err.message });
      return;
    }
    console.error('Get job type by id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  const parsed = jobTypeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body', details: parsed.error.errors });
    return;
  }
  try {
    const service = getJobTypeService();
    const jobType = await service.create(parsed.data);
    res.status(201).json(jobType);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'InvalidSectorError') {
      res.status(400).json({ error: err.message });
      return;
    }
    if (err instanceof Error && err.name === 'DuplicateJobTypeError') {
      res.status(409).json({ error: err.message });
      return;
    }
    console.error('Create job type error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid job type ID' });
    return;
  }
  const parsed = jobTypeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body', details: parsed.error.errors });
    return;
  }
  try {
    const service = getJobTypeService();
    const jobType = await service.update(id, parsed.data);
    res.status(200).json(jobType);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'JobTypeNotFoundError') {
      res.status(404).json({ error: err.message });
      return;
    }
    if (err instanceof Error && err.name === 'InvalidSectorError') {
      res.status(400).json({ error: err.message });
      return;
    }
    if (err instanceof Error && err.name === 'DuplicateJobTypeError') {
      res.status(409).json({ error: err.message });
      return;
    }
    console.error('Update job type error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteJobType(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params['id'] ?? '', 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid job type ID' });
    return;
  }
  try {
    const service = getJobTypeService();
    await service.delete(id);
    res.status(204).send();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'JobTypeNotFoundError') {
      res.status(404).json({ error: err.message });
      return;
    }
    console.error('Delete job type error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
