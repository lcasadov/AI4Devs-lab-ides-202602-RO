import { Request, Response } from 'express';
import multer, { StorageEngine, FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { CandidateService, DuplicateEmailError, NotFoundError } from '../../application/services/candidate.service';
import { CandidateRepository } from '../../infrastructure/repositories/candidate.repository';
import { CreateCandidateDto } from '../../domain/models/candidate';

// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `cv-${uniqueSuffix}${ext}`);
  },
});

const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const candidateRepository = new CandidateRepository();
const candidateService = new CandidateService(candidateRepository);

// Zod schema for input validation
const createCandidateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  education: z.string().max(5000).optional(),
  workExperience: z.string().max(5000).optional(),
});

export async function createCandidate(req: Request, res: Response): Promise<void> {
  try {
    const parsed = createCandidateSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      const field = firstError?.path.join('.') ?? '';
      const message = firstError?.message ?? 'Validation error';
      const errorMsg = field ? `${field}: ${message}` : message;
      res.status(400).json({ error: errorMsg });
      return;
    }

    const { firstName, lastName, email, phone, address, education, workExperience } = parsed.data;

    const dto: CreateCandidateDto = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone?.trim(),
      address: address?.trim(),
      education: education !== undefined ? parseJsonField(education) : undefined,
      workExperience: workExperience !== undefined ? parseJsonField(workExperience) : undefined,
    };

    const cvFileName = req.file?.filename;

    const candidate = await candidateService.create(dto, cvFileName);
    res.status(201).json(candidate);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'DuplicateEmailError') {
      res.status(409).json({ error: err.message });
    } else if (err instanceof Error && err.message === 'Only PDF and DOCX files are allowed') {
      res.status(400).json({ error: err.message });
    } else {
      console.error('Error creating candidate:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export async function getAllCandidates(_req: Request, res: Response): Promise<void> {
  try {
    const candidates = await candidateService.getAll();
    res.status(200).json(candidates);
  } catch (err: unknown) {
    console.error('Error fetching candidates:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getCandidateById(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params['id'], 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid candidate id' });
      return;
    }

    const candidate = await candidateService.getById(id);
    res.status(200).json(candidate);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'NotFoundError') {
      res.status(404).json({ error: err.message });
    } else {
      console.error('Error fetching candidate:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export async function deleteCandidate(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params['id'], 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid candidate id' });
      return;
    }

    await candidateService.delete(id);
    res.status(204).send();
  } catch (err: unknown) {
    if (err instanceof NotFoundError || (err instanceof Error && err.name === 'NotFoundError')) {
      res.status(404).json({ error: err.message });
    } else {
      console.error('Error deleting candidate:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

function parseJsonField(value: unknown): unknown {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}
