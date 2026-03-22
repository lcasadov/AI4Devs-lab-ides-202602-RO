import { ICandidateRepository } from '../../domain/repositories/candidate.repository.interface';
import { Candidate, CreateCandidateDto } from '../../domain/models/candidate';
import { getPrismaClient } from '../database/prisma-client';

const candidateSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  address: true,
  education: true,
  workExperience: true,
  cvFileName: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class CandidateRepository implements ICandidateRepository {
  private readonly prisma = getPrismaClient();

  async create(dto: CreateCandidateDto): Promise<Candidate> {
    const record = await this.prisma.candidate.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone ?? null,
        address: dto.address ?? null,
        education: dto.education !== undefined ? (dto.education as object) : undefined,
        workExperience: dto.workExperience !== undefined ? (dto.workExperience as object) : undefined,
        cvFileName: dto.cvFileName ?? null,
      },
      select: candidateSelect,
    });

    return this.mapToCandidate(record);
  }

  async findAll(): Promise<Candidate[]> {
    const records = await this.prisma.candidate.findMany({
      select: candidateSelect,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => this.mapToCandidate(r));
  }

  async findById(id: number): Promise<Candidate | null> {
    const record = await this.prisma.candidate.findUnique({
      where: { id },
      select: candidateSelect,
    });

    return record ? this.mapToCandidate(record) : null;
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    const record = await this.prisma.candidate.findUnique({
      where: { email },
      select: candidateSelect,
    });

    return record ? this.mapToCandidate(record) : null;
  }

  private mapToCandidate(record: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string | null;
    education: unknown;
    workExperience: unknown;
    cvFileName: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Candidate {
    return {
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      phone: record.phone ?? undefined,
      address: record.address ?? undefined,
      education: record.education ?? undefined,
      workExperience: record.workExperience ?? undefined,
      cvFileName: record.cvFileName ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
