import { CandidateService, DuplicateEmailError, NotFoundError } from '../application/services/candidate.service';
import { ICandidateRepository } from '../domain/repositories/candidate.repository.interface';
import { Candidate, CreateCandidateDto } from '../domain/models/candidate';

// ── Mock repository factory ───────────────────────────────────────────────────
function createMockRepository(): jest.Mocked<ICandidateRepository> {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    updateCvFileName: jest.fn(),
    delete: jest.fn(),
  };
}

// ── Shared fixtures ───────────────────────────────────────────────────────────
const baseDto: CreateCandidateDto = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
};

const candidateRecord: Candidate = {
  id: 1,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

// ── create ────────────────────────────────────────────────────────────────────
describe('CandidateService.create', () => {
  let repo: jest.Mocked<ICandidateRepository>;
  let service: CandidateService;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = createMockRepository();
    service = new CandidateService(repo);
  });

  it('calls repository.create with the correct data when email does not exist', async () => {
    // Arrange
    repo.findByEmail.mockResolvedValue(null);
    repo.create.mockResolvedValue(candidateRecord);

    // Act
    const result = await service.create(baseDto);

    // Assert
    expect(repo.findByEmail).toHaveBeenCalledWith(baseDto.email);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({
      firstName: baseDto.firstName,
      lastName: baseDto.lastName,
      email: baseDto.email,
    }));
    expect(result).toEqual(candidateRecord);
  });

  it('throws DuplicateEmailError when the email is already registered', async () => {
    // Arrange
    repo.findByEmail.mockResolvedValue(candidateRecord);

    // Act & Assert
    // NOTE: Using name/message check because ES5 target breaks instanceof for custom Error subclasses
    const thrown = await service.create(baseDto).catch((e) => e);
    expect(thrown).toBeDefined();
    expect(thrown.name).toBe('DuplicateEmailError');
    expect(thrown.message).toMatch(/already in use/i);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('passes the cvFileName from the argument to the repository', async () => {
    // Arrange
    repo.findByEmail.mockResolvedValue(null);
    repo.create.mockResolvedValue({ ...candidateRecord, cvFileName: 'cv-123.pdf' });

    // Act
    await service.create(baseDto, 'cv-123.pdf');

    // Assert
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ cvFileName: 'cv-123.pdf' })
    );
  });
});

// ── getAll ────────────────────────────────────────────────────────────────────
describe('CandidateService.getAll', () => {
  let repo: jest.Mocked<ICandidateRepository>;
  let service: CandidateService;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = createMockRepository();
    service = new CandidateService(repo);
  });

  it('returns the list provided by the repository', async () => {
    // Arrange
    repo.findAll.mockResolvedValue([candidateRecord]);

    // Act
    const result = await service.getAll();

    // Assert
    expect(repo.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([candidateRecord]);
  });

  it('returns an empty array when the repository has no candidates', async () => {
    // Arrange
    repo.findAll.mockResolvedValue([]);

    // Act
    const result = await service.getAll();

    // Assert
    expect(result).toEqual([]);
  });
});

// ── getById ───────────────────────────────────────────────────────────────────
describe('CandidateService.getById', () => {
  let repo: jest.Mocked<ICandidateRepository>;
  let service: CandidateService;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = createMockRepository();
    service = new CandidateService(repo);
  });

  it('returns the candidate when it exists', async () => {
    // Arrange
    repo.findById.mockResolvedValue(candidateRecord);

    // Act
    const result = await service.getById(1);

    // Assert
    expect(repo.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(candidateRecord);
  });

  it('throws NotFoundError when the candidate does not exist', async () => {
    // Arrange
    repo.findById.mockResolvedValue(null);

    // Act & Assert
    // NOTE: Using name/message check because ES5 target breaks instanceof for custom Error subclasses
    const thrown = await service.getById(999).catch((e) => e);
    expect(thrown).toBeDefined();
    expect(thrown.name).toBe('NotFoundError');
    expect(thrown.message).toMatch(/999/);
  });
});

// ── update ────────────────────────────────────────────────────────────────────
describe('CandidateService.update', () => {
  let repo: jest.Mocked<ICandidateRepository>;
  let service: CandidateService;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = createMockRepository();
    service = new CandidateService(repo);
  });

  it('updates and returns the candidate when it exists', async () => {
    // Arrange
    const updatedRecord: Candidate = { ...candidateRecord, firstName: 'John' };
    repo.findById.mockResolvedValue(candidateRecord);
    repo.update.mockResolvedValue(updatedRecord);

    // Act
    const result = await service.update(1, { firstName: 'John' });

    // Assert
    expect(repo.findById).toHaveBeenCalledWith(1);
    expect(repo.update).toHaveBeenCalledWith(1, { firstName: 'John' });
    expect(result).toEqual(updatedRecord);
  });

  it('throws NotFoundError when candidate does not exist', async () => {
    // Arrange
    repo.findById.mockResolvedValue(null);

    // Act & Assert
    const thrown = await service.update(999, { firstName: 'John' }).catch((e) => e);
    expect(thrown.name).toBe('NotFoundError');
    expect(thrown.message).toMatch(/999/);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('throws DuplicateEmailError when changing to an already used email', async () => {
    // Arrange
    const otherCandidate: Candidate = { ...candidateRecord, id: 2, email: 'other@example.com' };
    repo.findById.mockResolvedValue(candidateRecord);
    repo.findByEmail.mockResolvedValue(otherCandidate);

    // Act & Assert
    const thrown = await service.update(1, { email: 'other@example.com' }).catch((e) => e);
    expect(thrown.name).toBe('DuplicateEmailError');
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('does not check email uniqueness when email is unchanged', async () => {
    // Arrange
    const updatedRecord: Candidate = { ...candidateRecord, province: 'Madrid' };
    repo.findById.mockResolvedValue(candidateRecord);
    repo.update.mockResolvedValue(updatedRecord);

    // Act
    await service.update(1, { email: candidateRecord.email, province: 'Madrid' });

    // Assert
    expect(repo.findByEmail).not.toHaveBeenCalled();
    expect(repo.update).toHaveBeenCalledTimes(1);
  });
});

// ── updateCvFileName ──────────────────────────────────────────────────────────
describe('CandidateService.updateCvFileName', () => {
  let repo: jest.Mocked<ICandidateRepository>;
  let service: CandidateService;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = createMockRepository();
    service = new CandidateService(repo);
  });

  it('updates the CV file name and returns the candidate', async () => {
    // Arrange
    const updatedRecord: Candidate = { ...candidateRecord, cvFileName: '1-1234567890.pdf' };
    repo.findById.mockResolvedValue(candidateRecord);
    repo.updateCvFileName.mockResolvedValue(updatedRecord);

    // Act
    const result = await service.updateCvFileName(1, '1-1234567890.pdf');

    // Assert
    expect(repo.findById).toHaveBeenCalledWith(1);
    expect(repo.updateCvFileName).toHaveBeenCalledWith(1, '1-1234567890.pdf');
    expect(result.cvFileName).toBe('1-1234567890.pdf');
  });

  it('throws NotFoundError when the candidate does not exist', async () => {
    // Arrange
    repo.findById.mockResolvedValue(null);

    // Act & Assert
    const thrown = await service.updateCvFileName(999, 'file.pdf').catch((e) => e);
    expect(thrown.name).toBe('NotFoundError');
    expect(repo.updateCvFileName).not.toHaveBeenCalled();
  });
});
