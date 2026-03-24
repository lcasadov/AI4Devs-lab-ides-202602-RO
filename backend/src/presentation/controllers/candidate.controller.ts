import { Request, Response } from 'express';
import multer, { StorageEngine, FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { CandidateService, DuplicateEmailError, NotFoundError } from '../../application/services/candidate.service';
import { CandidateRepository } from '../../infrastructure/repositories/candidate.repository';
import { CreateCandidateDto, UpdateCandidateDto } from '../../domain/models/candidate';

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

export const uploadCv = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const id = req.params['id'] ?? 'unknown';
      const ext = path.extname(file.originalname);
      cb(null, `${id}-${Date.now()}${ext}`);
    },
  }),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const candidateRepository = new CandidateRepository();
const candidateService = new CandidateService(candidateRepository);

// Zod schema for input validation
const createCandidateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().regex(/^\+34[0-9]{9}$/, 'Phone must be in format +34XXXXXXXXX').optional(),
  address: z.string().max(500).optional(),
  postalCode: z.string().regex(/^\d{5}$/, 'Postal code must be exactly 5 digits').optional(),
  province: z.string().max(100).optional(),
  municipality: z.string().max(100).optional(),
  sectorId: z.coerce.number().int().positive().optional(),
  jobTypeId: z.coerce.number().int().positive().optional(),
  education: z.string().max(5000).optional(),
  workExperience: z.string().max(5000).optional(),
});

const updateCandidateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().regex(/^\+34[0-9]{9}$/, 'Phone must be in format +34XXXXXXXXX').optional(),
  address: z.string().max(500).optional(),
  postalCode: z.string().regex(/^\d{5}$/, 'Postal code must be exactly 5 digits').optional(),
  province: z.string().max(100).optional(),
  municipality: z.string().max(100).optional(),
  sectorId: z.coerce.number().int().positive().optional(),
  jobTypeId: z.coerce.number().int().positive().optional(),
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

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      postalCode,
      province,
      municipality,
      sectorId,
      jobTypeId,
      education,
      workExperience,
    } = parsed.data;

    const dto: CreateCandidateDto = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone?.trim(),
      address: address?.trim(),
      postalCode: postalCode?.trim(),
      province: province?.trim(),
      municipality: municipality?.trim(),
      sectorId,
      jobTypeId,
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

export async function updateCandidate(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params['id'], 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid candidate id' });
      return;
    }

    const parsed = updateCandidateSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      const field = firstError?.path.join('.') ?? '';
      const message = firstError?.message ?? 'Validation error';
      const errorMsg = field ? `${field}: ${message}` : message;
      res.status(400).json({ error: errorMsg });
      return;
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      postalCode,
      province,
      municipality,
      sectorId,
      jobTypeId,
      education,
      workExperience,
    } = parsed.data;

    const dto: UpdateCandidateDto = {
      ...(firstName !== undefined && { firstName: firstName.trim() }),
      ...(lastName !== undefined && { lastName: lastName.trim() }),
      ...(email !== undefined && { email: email.trim() }),
      ...(phone !== undefined && { phone: phone.trim() }),
      ...(address !== undefined && { address: address.trim() }),
      ...(postalCode !== undefined && { postalCode: postalCode.trim() }),
      ...(province !== undefined && { province: province.trim() }),
      ...(municipality !== undefined && { municipality: municipality.trim() }),
      ...(sectorId !== undefined && { sectorId }),
      ...(jobTypeId !== undefined && { jobTypeId }),
      ...(education !== undefined && { education: parseJsonField(education) }),
      ...(workExperience !== undefined && { workExperience: parseJsonField(workExperience) }),
    };

    const candidate = await candidateService.update(id, dto);
    res.status(200).json(candidate);
  } catch (err: unknown) {
    if (err instanceof NotFoundError || (err instanceof Error && err.name === 'NotFoundError')) {
      res.status(404).json({ error: err.message });
    } else if (err instanceof DuplicateEmailError || (err instanceof Error && err.name === 'DuplicateEmailError')) {
      res.status(409).json({ error: err.message });
    } else {
      console.error('Error updating candidate:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export async function uploadCandidateCv(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params['id'], 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid candidate id' });
      return;
    }

    // Verify candidate exists
    await candidateService.getById(id);

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const candidate = await candidateService.updateCvFileName(id, req.file.filename);
    res.status(200).json(candidate);
  } catch (err: unknown) {
    if (err instanceof NotFoundError || (err instanceof Error && err.name === 'NotFoundError')) {
      res.status(404).json({ error: err.message });
    } else if (err instanceof Error && err.message === 'Only PDF and DOCX files are allowed') {
      res.status(400).json({ error: err.message });
    } else {
      console.error('Error uploading CV:', err);
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
