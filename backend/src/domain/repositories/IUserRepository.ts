import { User, CreateUserDto, UpdateUserDto } from '../models/User';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByLogin(login: string): Promise<(User & { passwordHash: string }) | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(filters?: {
    login?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  }): Promise<User[]>;
  create(dto: CreateUserDto): Promise<User>;
  update(id: number, dto: UpdateUserDto): Promise<User>;
  delete(id: number): Promise<void>;
  updatePasswordHash(id: number, passwordHash: string): Promise<void>;
}
