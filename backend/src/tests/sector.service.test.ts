import {
  SectorService,
  SectorNotFoundError,
  DuplicateSectorNameError,
  SectorHasJobTypesError,
} from '../application/services/SectorService';
import { ISectorRepository } from '../domain/repositories/ISectorRepository';
import { Sector } from '../domain/models/Sector';

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

describe('SectorService', () => {
  let sectorRepo: jest.Mocked<ISectorRepository>;
  let service: SectorService;

  beforeEach(() => {
    sectorRepo = createMockSectorRepository();
    service = new SectorService(sectorRepo);
  });

  describe('findAll', () => {
    it('returns all sectors', async () => {
      // Arrange
      sectorRepo.findAll.mockResolvedValue([baseSector]);
      // Act
      const result = await service.findAll();
      // Assert
      expect(result).toEqual([baseSector]);
      expect(sectorRepo.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('returns sector when found', async () => {
      // Arrange
      sectorRepo.findById.mockResolvedValue(baseSector);
      // Act
      const result = await service.findById(1);
      // Assert
      expect(result).toEqual(baseSector);
    });

    it('throws SectorNotFoundError when not found', async () => {
      // Arrange
      sectorRepo.findById.mockResolvedValue(null);
      // Act & Assert
      await expect(service.findById(999)).rejects.toThrow('Sector with id 999 not found');
    });
  });

  describe('create', () => {
    it('creates sector successfully when name is unique', async () => {
      // Arrange
      sectorRepo.findByName.mockResolvedValue(null);
      sectorRepo.create.mockResolvedValue(baseSector);
      // Act
      const result = await service.create('Technology');
      // Assert
      expect(result).toEqual(baseSector);
      expect(sectorRepo.create).toHaveBeenCalledWith({ name: 'Technology' });
    });

    it('throws DuplicateSectorNameError when name already exists', async () => {
      // Arrange
      sectorRepo.findByName.mockResolvedValue(baseSector);
      // Act & Assert
      await expect(service.create('Technology')).rejects.toThrow("Sector name 'Technology' is already in use");
      expect(sectorRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates sector name when valid and unique', async () => {
      // Arrange
      const updated = { ...baseSector, name: 'Finance' };
      sectorRepo.findById.mockResolvedValue(baseSector);
      sectorRepo.findByName.mockResolvedValue(null);
      sectorRepo.update.mockResolvedValue(updated);
      // Act
      const result = await service.update(1, 'Finance');
      // Assert
      expect(result.name).toBe('Finance');
    });

    it('throws SectorNotFoundError if sector does not exist', async () => {
      // Arrange
      sectorRepo.findById.mockResolvedValue(null);
      // Act & Assert
      await expect(service.update(999, 'Finance')).rejects.toThrow('Sector with id 999 not found');
    });

    it('throws DuplicateSectorNameError if new name conflicts', async () => {
      // Arrange
      const other = { ...baseSector, id: 2, name: 'Finance' };
      sectorRepo.findById.mockResolvedValue(baseSector);
      sectorRepo.findByName.mockResolvedValue(other);
      // Act & Assert
      await expect(service.update(1, 'Finance')).rejects.toThrow("Sector name 'Finance' is already in use");
    });
  });

  describe('delete', () => {
    it('deletes sector when it has no job types', async () => {
      // Arrange
      sectorRepo.findById.mockResolvedValue(baseSector);
      sectorRepo.hasJobTypes.mockResolvedValue(false);
      sectorRepo.delete.mockResolvedValue(undefined);
      // Act
      await service.delete(1);
      // Assert
      expect(sectorRepo.delete).toHaveBeenCalledWith(1);
    });

    it('throws SectorHasJobTypesError when sector has job types', async () => {
      // Arrange
      sectorRepo.findById.mockResolvedValue(baseSector);
      sectorRepo.hasJobTypes.mockResolvedValue(true);
      // Act & Assert
      await expect(service.delete(1)).rejects.toThrow('has associated job types');
      expect(sectorRepo.delete).not.toHaveBeenCalled();
    });

    it('throws SectorNotFoundError if sector does not exist', async () => {
      // Arrange
      sectorRepo.findById.mockResolvedValue(null);
      // Act & Assert
      await expect(service.delete(999)).rejects.toThrow('Sector with id 999 not found');
    });
  });
});
