import fs from 'fs';
import path from 'path';
import { ICandidateRepository } from '../../domain/repositories/candidate.repository.interface';
import { Candidate, CreateCandidateDto, UpdateCandidateDto } from '../../domain/models/candidate';
import { getPrismaClient } from '../database/prisma-client';

const uploadsDir = path.resolve(__dirname, '../../../../uploads');

const candidateInclude = {
  sector: { select: { id: true, name: true } },
  jobType: { select: { id: true, name: true } },
} as const;

type CandidateRecord = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  postalCode: string | null;
  province: string | null;
  municipality: string | null;
  sectorId: number | null;
  jobTypeId: number | null;
  sector: { id: number; name: string } | null;
  jobType: { id: number; name: string } | null;
  education: unknown;
  workExperience: unknown;
  cvFileName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

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
        postalCode: dto.postalCode ?? null,
        province: dto.province ?? null,
        municipality: dto.municipality ?? null,
        sectorId: dto.sectorId ?? null,
        jobTypeId: dto.jobTypeId ?? null,
        education: dto.education !== undefined ? (dto.education as object) : undefined,
        workExperience: dto.workExperience !== undefined ? (dto.workExperience as object) : undefined,
        cvFileName: dto.cvFileName ?? null,
      },
      include: candidateInclude,
    });

    return this.mapToCandidate(record);
  }

  async findAll(): Promise<Candidate[]> {
    const records = await this.prisma.candidate.findMany({
      include: candidateInclude,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => this.mapToCandidate(r));
  }

  async findById(id: number): Promise<Candidate | null> {
    const record = await this.prisma.candidate.findUnique({
      where: { id },
      include: candidateInclude,
    });

    return record ? this.mapToCandidate(record) : null;
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    const record = await this.prisma.candidate.findUnique({
      where: { email },
      include: candidateInclude,
    });

    return record ? this.mapToCandidate(record) : null;
  }

  async update(id: number, dto: UpdateCandidateDto): Promise<Candidate> {
    const record = await this.prisma.candidate.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.postalCode !== undefined && { postalCode: dto.postalCode }),
        ...(dto.province !== undefined && { province: dto.province }),
        ...(dto.municipality !== undefined && { municipality: dto.municipality }),
        ...(dto.sectorId !== undefined && { sectorId: dto.sectorId }),
        ...(dto.jobTypeId !== undefined && { jobTypeId: dto.jobTypeId }),
        ...(dto.education !== undefined && { education: dto.education as object }),
        ...(dto.workExperience !== undefined && { workExperience: dto.workExperience as object }),
        ...(dto.cvFileName !== undefined && { cvFileName: dto.cvFileName }),
      },
      include: candidateInclude,
    });

    return this.mapToCandidate(record);
  }

  async updateCvFileName(id: number, cvFileName: string): Promise<Candidate> {
    const record = await this.prisma.candidate.update({
      where: { id },
      data: { cvFileName },
      include: candidateInclude,
    });

    return this.mapToCandidate(record);
  }

  async delete(id: number): Promise<void> {
    // Retrieve the CV filename before deleting the record
    const record = await this.prisma.candidate.findUnique({
      where: { id },
      select: { cvFileName: true },
    });

    await this.prisma.candidate.delete({ where: { id } });

    if (record?.cvFileName) {
      const cvPath = path.join(uploadsDir, record.cvFileName);
      if (fs.existsSync(cvPath)) {
        fs.unlinkSync(cvPath);
      }
    }
  }

  private mapToCandidate(record: CandidateRecord): Candidate {
    return {
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      phone: record.phone ?? undefined,
      address: record.address ?? undefined,
      postalCode: record.postalCode ?? undefined,
      province: record.province ?? undefined,
      municipality: record.municipality ?? undefined,
      sectorId: record.sectorId ?? undefined,
      jobTypeId: record.jobTypeId ?? undefined,
      sector: record.sector ?? undefined,
      jobType: record.jobType ?? undefined,
      education: record.education ?? undefined,
      workExperience: record.workExperience ?? undefined,
      cvFileName: record.cvFileName ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
