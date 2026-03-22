import { Candidate, CreateCandidateDto } from '../models/candidate';

export interface ICandidateRepository {
  create(dto: CreateCandidateDto): Promise<Candidate>;
  findAll(): Promise<Candidate[]>;
  findById(id: number): Promise<Candidate | null>;
  findByEmail(email: string): Promise<Candidate | null>;
}
