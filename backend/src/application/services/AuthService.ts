import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IEmailService } from '../../domain/services/IEmailService';
import { User } from '../../domain/models/User';
import {
  comparePassword,
  hashPassword,
  generatePassword,
  validatePassword,
} from '../../infrastructure/utils/passwordUtils';

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsError';
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

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
  ) {}

  async login(login: string, password: string): Promise<{ token: string; user: User }> {
    const userWithHash = await this.userRepository.findByLogin(login);
    if (!userWithHash) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await comparePassword(password, userWithHash.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    if (!userWithHash.active) {
      throw new InvalidCredentialsError();
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const expiresIn = process.env.JWT_EXPIRES_IN ?? '8h';
    const token = jwt.sign(
      { userId: userWithHash.id, login: userWithHash.login, role: userWithHash.role },
      secret,
      { expiresIn } as jwt.SignOptions,
    );

    // Build user object without passwordHash
    const user: User = {
      id: userWithHash.id,
      login: userWithHash.login,
      firstName: userWithHash.firstName,
      lastName: userWithHash.lastName,
      email: userWithHash.email,
      role: userWithHash.role,
      active: userWithHash.active,
      createdAt: userWithHash.createdAt,
      updatedAt: userWithHash.updatedAt,
    };

    return { token, user };
  }

  async forgotPassword(login: string): Promise<void> {
    const userWithHash = await this.userRepository.findByLogin(login);
    if (!userWithHash) {
      // Silent — do not reveal whether user exists
      return;
    }

    const newPassword = generatePassword();
    const passwordHash = await hashPassword(newPassword);
    await this.userRepository.updatePasswordHash(userWithHash.id, passwordHash);

    await this.emailService.send({
      to: userWithHash.email,
      subject: 'LTI ATS — Password Reset',
      html: `
        <p>Hello ${userWithHash.firstName},</p>
        <p>Your password has been reset. Your new temporary password is:</p>
        <p><strong>${newPassword}</strong></p>
        <p>Please log in and change your password immediately.</p>
      `,
    });
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<void> {
    if (newPassword !== confirmPassword) {
      throw new InvalidPasswordError('New password and confirmation do not match');
    }

    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      throw new InvalidPasswordError(validation.message ?? 'Password does not meet policy requirements');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const userWithHash = await this.userRepository.findByLogin(user.login);
    if (!userWithHash) {
      throw new InvalidCredentialsError();
    }

    const currentMatches = await comparePassword(currentPassword, userWithHash.passwordHash);
    if (!currentMatches) {
      throw new InvalidCurrentPasswordError();
    }

    const newHash = await hashPassword(newPassword);
    await this.userRepository.updatePasswordHash(userId, newHash);
  }
}
