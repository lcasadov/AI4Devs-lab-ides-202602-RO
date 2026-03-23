import { AuthService, InvalidCredentialsError, InvalidPasswordError, InvalidCurrentPasswordError } from '../application/services/AuthService';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { IEmailService } from '../domain/services/IEmailService';
import { User } from '../domain/models/User';
import * as passwordUtils from '../domain/utils/passwordUtils';

// ── Mock password utilities ────────────────────────────────────────────────────
jest.mock('../domain/utils/passwordUtils', () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
  generatePassword: jest.fn(),
  validatePassword: jest.fn(),
}));

// ── Mock factory helpers ───────────────────────────────────────────────────────
function createMockUserRepository(): jest.Mocked<IUserRepository> {
  return {
    findById: jest.fn(),
    findByLogin: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updatePasswordHash: jest.fn(),
  };
}

function createMockEmailService(): jest.Mocked<IEmailService> {
  return {
    send: jest.fn(),
  };
}

// ── Shared fixtures ────────────────────────────────────────────────────────────
const userRecord: User = {
  id: 1,
  login: 'jdoe',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  role: 'ADMIN',
  active: true,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

const userWithHash = { ...userRecord, passwordHash: '$2b$12$hashedpassword' };

// ── AuthService.login ──────────────────────────────────────────────────────────
describe('AuthService.login', () => {
  let userRepo: jest.Mocked<IUserRepository>;
  let emailService: jest.Mocked<IEmailService>;
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepo = createMockUserRepository();
    emailService = createMockEmailService();
    service = new AuthService(userRepo, emailService);
    process.env['JWT_SECRET'] = 'test-secret-for-tests';
    process.env['JWT_EXPIRES_IN'] = '1h';
  });

  it('returns { token, user } when credentials are correct', async () => {
    // Arrange
    userRepo.findByLogin.mockResolvedValue(userWithHash);
    (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(true);

    // Act
    const result = await service.login('jdoe', 'ValidPass@1');

    // Assert
    expect(userRepo.findByLogin).toHaveBeenCalledWith('jdoe');
    expect(passwordUtils.comparePassword).toHaveBeenCalledWith('ValidPass@1', userWithHash.passwordHash);
    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('user');
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.user.login).toBe('jdoe');
  });

  it('throws InvalidCredentialsError when login does not exist', async () => {
    // Arrange
    userRepo.findByLogin.mockResolvedValue(null);

    // Act
    const thrown = await service.login('nonexistent', 'anyPassword').catch((e) => e);

    // Assert
    expect(thrown).toBeDefined();
    expect(thrown.name).toBe('InvalidCredentialsError');
    expect(passwordUtils.comparePassword).not.toHaveBeenCalled();
  });

  it('throws InvalidCredentialsError when password is incorrect', async () => {
    // Arrange
    userRepo.findByLogin.mockResolvedValue(userWithHash);
    (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(false);

    // Act
    const thrown = await service.login('jdoe', 'WrongPass@1').catch((e) => e);

    // Assert
    expect(thrown).toBeDefined();
    expect(thrown.name).toBe('InvalidCredentialsError');
  });

  it('throws InvalidCredentialsError when user is inactive', async () => {
    // Arrange
    const inactiveUser = { ...userWithHash, active: false };
    userRepo.findByLogin.mockResolvedValue(inactiveUser);
    (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(true);

    // Act
    const thrown = await service.login('jdoe', 'ValidPass@1').catch((e) => e);

    // Assert
    expect(thrown).toBeDefined();
    expect(thrown.name).toBe('InvalidCredentialsError');
  });
});

// ── AuthService.forgotPassword ─────────────────────────────────────────────────
describe('AuthService.forgotPassword', () => {
  let userRepo: jest.Mocked<IUserRepository>;
  let emailService: jest.Mocked<IEmailService>;
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepo = createMockUserRepository();
    emailService = createMockEmailService();
    service = new AuthService(userRepo, emailService);
  });

  it('calls updatePasswordHash and emailService.send when login exists', async () => {
    // Arrange
    userRepo.findByLogin.mockResolvedValue(userWithHash);
    (passwordUtils.generatePassword as jest.Mock).mockReturnValue('NewPass@123');
    (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('$2b$12$newhashedpassword');
    userRepo.updatePasswordHash.mockResolvedValue(undefined);
    emailService.send.mockResolvedValue(undefined);

    // Act
    await service.forgotPassword('jdoe');

    // Assert
    expect(userRepo.updatePasswordHash).toHaveBeenCalledWith(userWithHash.id, '$2b$12$newhashedpassword');
    expect(emailService.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: userWithHash.email }),
    );
  });

  it('does nothing when login does not exist (silent)', async () => {
    // Arrange
    userRepo.findByLogin.mockResolvedValue(null);

    // Act
    await service.forgotPassword('nonexistent');

    // Assert
    expect(userRepo.updatePasswordHash).not.toHaveBeenCalled();
    expect(emailService.send).not.toHaveBeenCalled();
  });
});

// ── AuthService.changePassword ─────────────────────────────────────────────────
describe('AuthService.changePassword', () => {
  let userRepo: jest.Mocked<IUserRepository>;
  let emailService: jest.Mocked<IEmailService>;
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepo = createMockUserRepository();
    emailService = createMockEmailService();
    service = new AuthService(userRepo, emailService);
  });

  it('calls updatePasswordHash on success', async () => {
    // Arrange
    (passwordUtils.validatePassword as jest.Mock).mockReturnValue({ valid: true });
    userRepo.findById.mockResolvedValue(userRecord);
    userRepo.findByLogin.mockResolvedValue(userWithHash);
    (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(true);
    (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('$2b$12$newhashedpassword');
    userRepo.updatePasswordHash.mockResolvedValue(undefined);

    // Act
    await service.changePassword(1, 'OldPass@1', 'NewPass@1', 'NewPass@1');

    // Assert
    expect(userRepo.updatePasswordHash).toHaveBeenCalledWith(1, '$2b$12$newhashedpassword');
  });

  it('throws InvalidCurrentPasswordError when current password is incorrect', async () => {
    // Arrange
    (passwordUtils.validatePassword as jest.Mock).mockReturnValue({ valid: true });
    userRepo.findById.mockResolvedValue(userRecord);
    userRepo.findByLogin.mockResolvedValue(userWithHash);
    (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(false);

    // Act
    const thrown = await service.changePassword(1, 'WrongCurrent@1', 'NewPass@1', 'NewPass@1').catch((e) => e);

    // Assert
    expect(thrown).toBeDefined();
    expect(thrown.name).toBe('InvalidCurrentPasswordError');
    expect(userRepo.updatePasswordHash).not.toHaveBeenCalled();
  });

  it('throws InvalidPasswordError when new password does not meet policy', async () => {
    // Arrange
    (passwordUtils.validatePassword as jest.Mock).mockReturnValue({
      valid: false,
      message: 'Password must be at least 8 characters long.',
    });

    // Act
    const thrown = await service.changePassword(1, 'OldPass@1', 'short', 'short').catch((e) => e);

    // Assert
    expect(thrown).toBeDefined();
    expect(thrown.name).toBe('InvalidPasswordError');
    expect(thrown.message).toMatch(/8 characters/i);
    expect(userRepo.updatePasswordHash).not.toHaveBeenCalled();
  });

  it('throws InvalidPasswordError when confirmation does not match', async () => {
    // Arrange — no need to mock validatePassword, check happens before it

    // Act
    const thrown = await service.changePassword(1, 'OldPass@1', 'NewPass@1', 'DifferentPass@1').catch((e) => e);

    // Assert
    expect(thrown).toBeDefined();
    expect(thrown.name).toBe('InvalidPasswordError');
    expect(thrown.message).toMatch(/do not match/i);
    expect(userRepo.updatePasswordHash).not.toHaveBeenCalled();
  });
});
