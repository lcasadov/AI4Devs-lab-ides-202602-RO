import { UserService, UserNotFoundError, DuplicateLoginError, DuplicateEmailError, CannotDeleteSelfError } from '../application/services/UserService';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { IEmailService } from '../domain/services/IEmailService';
import { User } from '../domain/models/User';
import * as passwordUtils from '../domain/utils/passwordUtils';

// ── Mock password utilities ────────────────────────────────────────────────────
jest.mock('../domain/utils/passwordUtils', () => ({
  generatePassword: jest.fn(),
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
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
const baseUser: User = {
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

const baseUserWithHash = { ...baseUser, passwordHash: '$2b$12$hashedpassword' };

const createInput = {
  login: 'jdoe',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  role: 'ADMIN' as const,
};

// ── UserService.create ─────────────────────────────────────────────────────────
describe('UserService.create', () => {
  let userRepo: jest.Mocked<IUserRepository>;
  let emailService: jest.Mocked<IEmailService>;
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepo = createMockUserRepository();
    emailService = createMockEmailService();
    service = new UserService(userRepo, emailService);
  });

  it('creates user and calls emailService.send on success', async () => {
    // Arrange
    userRepo.findByLogin.mockResolvedValue(null as unknown as (User & { passwordHash: string }) | null);
    userRepo.findByEmail.mockResolvedValue(null);
    (passwordUtils.generatePassword as jest.Mock).mockReturnValue('TempPass@1');
    (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('$2b$12$hash');
    userRepo.create.mockResolvedValue(baseUser);
    emailService.send.mockResolvedValue(undefined);

    // Act
    const result = await service.create(createInput);

    // Assert
    expect(userRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ login: 'jdoe', email: 'jane.doe@example.com' }),
    );
    expect(emailService.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'jane.doe@example.com' }),
    );
    expect(result).toEqual(baseUser);
  });

  it('throws DuplicateLoginError when login is already taken', async () => {
    // Arrange
    userRepo.findByLogin.mockResolvedValue(baseUserWithHash);

    // Act
    const thrown = await service.create(createInput).catch((e) => e);

    // Assert
    expect(thrown).toBeDefined();
    expect(thrown.name).toBe('DuplicateLoginError');
    expect(thrown.message).toMatch(/jdoe/);
    expect(userRepo.create).not.toHaveBeenCalled();
  });

  it('throws DuplicateEmailError when email is already taken', async () => {
    // Arrange
    userRepo.findByLogin.mockResolvedValue(null as unknown as (User & { passwordHash: string }) | null);
    userRepo.findByEmail.mockResolvedValue(baseUser);

    // Act
    const thrown = await service.create(createInput).catch((e) => e);

    // Assert
    expect(thrown).toBeDefined();
    expect(thrown.name).toBe('DuplicateEmailError');
    expect(thrown.message).toMatch(/jane.doe@example.com/);
    expect(userRepo.create).not.toHaveBeenCalled();
  });
});

// ── UserService.findById ───────────────────────────────────────────────────────
describe('UserService.findById', () => {
  let userRepo: jest.Mocked<IUserRepository>;
  let emailService: jest.Mocked<IEmailService>;
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepo = createMockUserRepository();
    emailService = createMockEmailService();
    service = new UserService(userRepo, emailService);
  });

  it('returns user when it exists', async () => {
    // Arrange
    userRepo.findById.mockResolvedValue(baseUser);

    // Act
    const result = await service.findById(1);

    // Assert
    expect(userRepo.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(baseUser);
  });

  it('throws UserNotFoundError when user does not exist', async () => {
    // Arrange
    userRepo.findById.mockResolvedValue(null);

    // Act
    const thrown = await service.findById(999).catch((e) => e);

    // Assert
    expect(thrown).toBeDefined();
    expect(thrown.name).toBe('UserNotFoundError');
    expect(thrown.message).toMatch(/999/);
  });
});

// ── UserService.update ─────────────────────────────────────────────────────────
describe('UserService.update', () => {
  let userRepo: jest.Mocked<IUserRepository>;
  let emailService: jest.Mocked<IEmailService>;
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepo = createMockUserRepository();
    emailService = createMockEmailService();
    service = new UserService(userRepo, emailService);
  });

  it('updates user fields on success', async () => {
    // Arrange
    const updatedUser = { ...baseUser, firstName: 'Janet' };
    userRepo.findById.mockResolvedValue(baseUser);
    userRepo.update.mockResolvedValue(updatedUser);

    // Act
    const result = await service.update(1, { firstName: 'Janet' });

    // Assert
    expect(userRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ firstName: 'Janet' }));
    expect(result.firstName).toBe('Janet');
  });

  it('throws DuplicateLoginError when changing to a login already in use', async () => {
    // Arrange
    const otherUserWithHash = { ...baseUserWithHash, id: 2, login: 'other' };
    userRepo.findById.mockResolvedValue(baseUser);
    userRepo.findByLogin.mockResolvedValue(otherUserWithHash);

    // Act
    const thrown = await service.update(1, { login: 'other' }).catch((e) => e);

    // Assert
    expect(thrown).toBeDefined();
    expect(thrown.name).toBe('DuplicateLoginError');
    expect(userRepo.update).not.toHaveBeenCalled();
  });
});

// ── UserService.delete ─────────────────────────────────────────────────────────
describe('UserService.delete', () => {
  let userRepo: jest.Mocked<IUserRepository>;
  let emailService: jest.Mocked<IEmailService>;
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepo = createMockUserRepository();
    emailService = createMockEmailService();
    service = new UserService(userRepo, emailService);
  });

  it('calls repository.delete on success', async () => {
    // Arrange
    userRepo.findById.mockResolvedValue(baseUser);
    userRepo.delete.mockResolvedValue(undefined);

    // Act
    await service.delete(1, 2); // requestingUserId is 2, not 1

    // Assert
    expect(userRepo.delete).toHaveBeenCalledWith(1);
  });

  it('throws CannotDeleteSelfError when user tries to delete their own account', async () => {
    // Arrange — no repo mock needed, check is done before any DB call

    // Act
    const thrown = await service.delete(1, 1).catch((e) => e); // same userId

    // Assert
    expect(thrown).toBeDefined();
    expect(thrown.name).toBe('CannotDeleteSelfError');
    expect(userRepo.delete).not.toHaveBeenCalled();
  });
});

// ── UserService.resetPassword ──────────────────────────────────────────────────
describe('UserService.resetPassword', () => {
  let userRepo: jest.Mocked<IUserRepository>;
  let emailService: jest.Mocked<IEmailService>;
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepo = createMockUserRepository();
    emailService = createMockEmailService();
    service = new UserService(userRepo, emailService);
  });

  it('calls updatePasswordHash and emailService.send on success', async () => {
    // Arrange
    userRepo.findById.mockResolvedValue(baseUser);
    (passwordUtils.generatePassword as jest.Mock).mockReturnValue('ResetPass@1');
    (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('$2b$12$resethash');
    userRepo.updatePasswordHash.mockResolvedValue(undefined);
    emailService.send.mockResolvedValue(undefined);

    // Act
    await service.resetPassword(1);

    // Assert
    expect(userRepo.updatePasswordHash).toHaveBeenCalledWith(1, '$2b$12$resethash');
    expect(emailService.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: baseUser.email }),
    );
  });
});
