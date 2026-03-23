import {
  JobTypeService,
  JobTypeNotFoundError,
  DuplicateJobTypeError,
  InvalidSectorError,
} from '../application/services/JobTypeService';
import { IJobTypeRepository } from '../domain/repositories/IJobTypeRepository';
import { ISectorRepository } from '../domain/repositories/ISectorRepository';
import { JobType } from '../domain/models/JobType';
import { Sector } from '../domain/models/Sector';

function createMockJobTypeRepository(): jest.Mocked<IJobTypeRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByNameAndSector: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

function createMockSectorRepository(): jest.Mocked<ISectorRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    hasJobTypes: jest.fn(),
  };
}

const baseSector: Sector = {
  id: 1,
  name: 'Technology',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const baseJobType: JobType = {
  id: 1,
  name: 'Backend Developer',
  sectorId: 1,
  sector: { id: 1, name: 'Technology' },
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('JobTypeService', () => {
  let jobTypeRepo: jest.Mocked<IJobTypeRepository>;
  let sectorRepo: jest.Mocked<ISectorRepository>;
  let service: JobTypeService;

  beforeEach(() => {
    jobTypeRepo = createMockJobTypeRepository();
    sectorRepo = createMockSectorRepository();
    service = new JobTypeService(jobTypeRepo, sectorRepo);
  });

  describe('create', () => {
    it('creates job type successfully', async () => {
      // Arrange
      sectorRepo.findById.mockResolvedValue(baseSector);
      jobTypeRepo.findByNameAndSector.mockResolvedValue(null);
      jobTypeRepo.create.mockResolvedValue(baseJobType);
      // Act
      const result = await service.create({ name: 'Backend Developer', sectorId: 1 });
      // Assert
      expect(result).toEqual(baseJobType);
      expect(jobTypeRepo.create).toHaveBeenCalledWith({ name: 'Backend Developer', sectorId: 1 });
    });

    it('throws InvalidSectorError when sectorId does not exist', async () => {
      // Arrange
      sectorRepo.findById.mockResolvedValue(null);
      // Act & Assert
      await expect(service.create({ name: 'Backend Developer', sectorId: 999 })).rejects.toThrow('Sector with id 999 does not exist');
      expect(jobTypeRepo.create).not.toHaveBeenCalled();
    });

    it('throws DuplicateJobTypeError when (name, sectorId) already exists', async () => {
      // Arrange
      sectorRepo.findById.mockResolvedValue(baseSector);
      jobTypeRepo.findByNameAndSector.mockResolvedValue(baseJobType);
      // Act & Assert
      await expect(service.create({ name: 'Backend Developer', sectorId: 1 })).rejects.toThrow('already exists in sector');
      expect(jobTypeRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('returns job type when found', async () => {
      // Arrange
      jobTypeRepo.findById.mockResolvedValue(baseJobType);
      // Act
      const result = await service.findById(1);
      // Assert
      expect(result).toEqual(baseJobType);
    });

    it('throws JobTypeNotFoundError when not found', async () => {
      // Arrange
      jobTypeRepo.findById.mockResolvedValue(null);
      // Act & Assert
      await expect(service.findById(999)).rejects.toThrow('JobType with id 999 not found');
    });
  });

  describe('delete', () => {
    it('deletes job type when it exists', async () => {
      // Arrange
      jobTypeRepo.findById.mockResolvedValue(baseJobType);
      jobTypeRepo.delete.mockResolvedValue(undefined);
      // Act
      await service.delete(1);
      // Assert
      expect(jobTypeRepo.delete).toHaveBeenCalledWith(1);
    });

    it('throws JobTypeNotFoundError when not found', async () => {
      // Arrange
      jobTypeRepo.findById.mockResolvedValue(null);
      // Act & Assert
      await expect(service.delete(999)).rejects.toThrow('JobType with id 999 not found');
      expect(jobTypeRepo.delete).not.toHaveBeenCalled();
    });
  });
});
