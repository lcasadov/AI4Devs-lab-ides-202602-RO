import { ICandidateRepository } from '../../domain/repositories/candidate.repository.interface';
import { Candidate, CreateCandidateDto, UpdateCandidateDto } from '../../domain/models/candidate';

export class DuplicateEmailError extends Error {
  constructor(_email: string) {
    super(`Email address is already in use`);
    this.name = 'DuplicateEmailError';
  }
}

export class NotFoundError extends Error {
  constructor(id: number) {
    super(`Candidate with id '${id}' not found`);
    this.name = 'NotFoundError';
  }
}

export class CandidateService {
  constructor(private readonly candidateRepository: ICandidateRepository) {}

  async create(dto: CreateCandidateDto, cvFileName?: string): Promise<Candidate> {
    const existing = await this.candidateRepository.findByEmail(dto.email);
    if (existing) {
      throw new DuplicateEmailError(dto.email);
    }

    const createDto: CreateCandidateDto = {
      ...dto,
      cvFileName: cvFileName ?? dto.cvFileName,
    };

    return this.candidateRepository.create(createDto);
  }

  async getAll(): Promise<Candidate[]> {
    return this.candidateRepository.findAll();
  }

  async getById(id: number): Promise<Candidate> {
    const candidate = await this.candidateRepository.findById(id);
    if (!candidate) {
      throw new NotFoundError(id);
    }
    return candidate;
  }

  async update(id: number, dto: UpdateCandidateDto): Promise<Candidate> {
    const existing = await this.candidateRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(id);
    }

    if (dto.email !== undefined && dto.email !== existing.email) {
      const emailOwner = await this.candidateRepository.findByEmail(dto.email);
      if (emailOwner) {
        throw new DuplicateEmailError(dto.email);
      }
    }

    return this.candidateRepository.update(id, dto);
  }

  async updateCvFileName(id: number, cvFileName: string): Promise<Candidate> {
    const existing = await this.candidateRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(id);
    }
    return this.candidateRepository.updateCvFileName(id, cvFileName);
  }

  async delete(id: number): Promise<void> {
    const candidate = await this.candidateRepository.findById(id);
    if (!candidate) {
      throw new NotFoundError(id);
    }
    await this.candidateRepository.delete(id);
  }
}
