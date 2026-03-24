import { Candidate, CreateCandidateDto, UpdateCandidateDto } from '../models/candidate';

export interface ICandidateRepository {
  create(dto: CreateCandidateDto): Promise<Candidate>;
  findAll(): Promise<Candidate[]>;
  findById(id: number): Promise<Candidate | null>;
  findByEmail(email: string): Promise<Candidate | null>;
  update(id: number, dto: UpdateCandidateDto): Promise<Candidate>;
  updateCvFileName(id: number, cvFileName: string): Promise<Candidate>;
  delete(id: number): Promise<void>;
}
