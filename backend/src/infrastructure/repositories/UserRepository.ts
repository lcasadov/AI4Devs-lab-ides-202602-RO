import { getPrismaClient } from '../database/prisma-client';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User, CreateUserDto, UpdateUserDto } from '../../domain/models/User';

const userSelect = {
  id: true,
  login: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  active: true,
  createdAt: true,
  updatedAt: true,
};

export class UserRepository implements IUserRepository {
  async findById(id: number): Promise<User | null> {
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
    if (!user) return null;
    return { ...user, role: user.role as User['role'] };
  }

  async findByLogin(login: string): Promise<(User & { passwordHash: string }) | null> {
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { login },
      select: {
        ...userSelect,
        passwordHash: true,
      },
    });
    if (!user) return null;
    return { ...user, role: user.role as User['role'] };
  }

  async findByEmail(email: string): Promise<User | null> {
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email },
      select: userSelect,
    });
    if (!user) return null;
    return { ...user, role: user.role as User['role'] };
  }

  async findAll(filters?: {
    login?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  }): Promise<User[]> {
    const prisma = getPrismaClient();
    const where = filters
      ? {
          ...(filters.login ? { login: { contains: filters.login } } : {}),
          ...(filters.firstName ? { firstName: { contains: filters.firstName } } : {}),
          ...(filters.lastName ? { lastName: { contains: filters.lastName } } : {}),
          ...(filters.email ? { email: { contains: filters.email } } : {}),
          ...(filters.role ? { role: filters.role as 'ADMIN' | 'RECRUITER' } : {}),
        }
      : {};
    const users = await prisma.user.findMany({
      where,
      select: userSelect,
    });
    return users.map((u) => ({ ...u, role: u.role as User['role'] }));
  }

  async create(dto: CreateUserDto): Promise<User> {
    const prisma = getPrismaClient();
    const user = await prisma.user.create({
      data: {
        login: dto.login,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash: dto.passwordHash,
        role: dto.role,
      },
      select: userSelect,
    });
    return { ...user, role: user.role as User['role'] };
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const prisma = getPrismaClient();
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(dto.login !== undefined ? { login: dto.login } : {}),
        ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
        ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.role !== undefined ? { role: dto.role } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {}),
      },
      select: userSelect,
    });
    return { ...user, role: user.role as User['role'] };
  }

  async delete(id: number): Promise<void> {
    const prisma = getPrismaClient();
    await prisma.user.delete({ where: { id } });
  }

  async updatePasswordHash(id: number, passwordHash: string): Promise<void> {
    const prisma = getPrismaClient();
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }
}
