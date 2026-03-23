import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IEmailService } from '../../domain/services/IEmailService';
import { User, CreateUserDto, UpdateUserDto } from '../../domain/models/User';
import {
  generatePassword,
  hashPassword,
} from '../../domain/utils/passwordUtils';

export class UserNotFoundError extends Error {
  constructor(id: number) {
    super(`User with id ${id} not found`);
    this.name = 'UserNotFoundError';
  }
}

export class DuplicateLoginError extends Error {
  constructor(login: string) {
    super(`Login '${login}' is already in use`);
    this.name = 'DuplicateLoginError';
  }
}

export class DuplicateEmailError extends Error {
  constructor(email: string) {
    super(`Email '${email}' is already in use`);
    this.name = 'DuplicateEmailError';
  }
}

export class CannotDeleteSelfError extends Error {
  constructor() {
    super('You cannot delete your own user account');
    this.name = 'CannotDeleteSelfError';
  }
}

export class InvalidPasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPasswordError';
  }
}

export class InvalidCurrentPasswordError extends Error {
  constructor() {
    super('Current password is incorrect');
    this.name = 'InvalidCurrentPasswordError';
  }
}

export interface CreateUserInput {
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'RECRUITER';
}

export interface UpdateUserInput {
  login?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'ADMIN' | 'RECRUITER';
  active?: boolean;
}

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
  ) {}

  async findAll(filters?: {
    login?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  }): Promise<User[]> {
    return this.userRepository.findAll(filters);
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError(id);
    }
    return user;
  }

  async create(input: CreateUserInput): Promise<User> {
    // Check uniqueness
    const existingByLogin = await this.userRepository.findByLogin(input.login);
    if (existingByLogin) {
      throw new DuplicateLoginError(input.login);
    }

    const existingByEmail = await this.userRepository.findByEmail(input.email);
    if (existingByEmail) {
      throw new DuplicateEmailError(input.email);
    }

    const temporaryPassword = generatePassword();
    const passwordHash = await hashPassword(temporaryPassword);

    const dto: CreateUserDto = {
      login: input.login,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      role: input.role,
    };

    const user = await this.userRepository.create(dto);

    await this.emailService.send({
      to: user.email,
      subject: 'Welcome to LTI ATS',
      html: `
        <p>Hello ${user.firstName},</p>
        <p>Your account has been created. Your login credentials are:</p>
        <ul>
          <li><strong>Login:</strong> ${user.login}</li>
          <li><strong>Password:</strong> ${temporaryPassword}</li>
        </ul>
        <p>Please log in and change your password as soon as possible.</p>
      `,
    });

    return user;
  }

  async update(id: number, input: UpdateUserInput): Promise<User> {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new UserNotFoundError(id);
    }

    if (input.login !== undefined && input.login !== existing.login) {
      const existingByLogin = await this.userRepository.findByLogin(input.login);
      if (existingByLogin) {
        throw new DuplicateLoginError(input.login);
      }
    }

    if (input.email !== undefined && input.email !== existing.email) {
      const existingByEmail = await this.userRepository.findByEmail(input.email);
      if (existingByEmail) {
        throw new DuplicateEmailError(input.email);
      }
    }

    const dto: UpdateUserDto = {
      ...(input.login !== undefined ? { login: input.login } : {}),
      ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
      ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
    };

    return this.userRepository.update(id, dto);
  }

  async delete(id: number, requestingUserId: number): Promise<void> {
    if (id === requestingUserId) {
      throw new CannotDeleteSelfError();
    }

    const existing = await this.userRepository.findById(id);
    if (!existing) {
      throw new UserNotFoundError(id);
    }

    await this.userRepository.delete(id);
  }

  async resetPassword(id: number): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError(id);
    }

    const newPassword = generatePassword();
    const passwordHash = await hashPassword(newPassword);
    await this.userRepository.updatePasswordHash(id, passwordHash);

    await this.emailService.send({
      to: user.email,
      subject: 'LTI ATS — Password Reset',
      html: `
        <p>Hello ${user.firstName},</p>
        <p>Your password has been reset by an administrator. Your new temporary password is:</p>
        <p><strong>${newPassword}</strong></p>
        <p>Please log in and change your password immediately.</p>
      `,
    });
  }
}
