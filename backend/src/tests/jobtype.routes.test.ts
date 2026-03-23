import request from 'supertest';
import jwt from 'jsonwebtoken';

// ── Mock Prisma BEFORE importing the app ──────────────────────────────────────
const mockPrismaSector = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

const mockPrismaJobType = {
  findMany: jest.fn(),
  findUnique: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
};

jest.mock('../infrastructure/database/prisma-client', () => ({
  getPrismaClient: jest.fn(() => ({
    user: { findUnique: jest.fn() },
    candidate: { findMany: jest.fn() },
    sector: mockPrismaSector,
    jobType: mockPrismaJobType,
  })),
}));

jest.mock('../infrastructure/services/EmailService', () => ({
  getEmailService: jest.fn(() => ({ send: jest.fn() })),
}));

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterAll(() => {
  jest.restoreAllMocks();
});

import { app } from '../index';

const TEST_JWT_SECRET = 'test-secret-for-tests';

function generateToken(role: 'ADMIN' | 'RECRUITER'): string {
  return jwt.sign({ userId: 1, login: 'testuser', role }, TEST_JWT_SECRET, { expiresIn: '1h' });
}

const baseSector = { id: 1, name: 'Technology', createdAt: new Date(), updatedAt: new Date() };
const baseJobType = {
  id: 1,
  name: 'Backend Developer',
  sectorId: 1,
  sector: { id: 1, name: 'Technology' },
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env['JWT_SECRET'] = TEST_JWT_SECRET;
});

describe('GET /jobtypes', () => {
  it('returns 200 with job type list for authenticated user', async () => {
    // Arrange
    mockPrismaJobType.findMany.mockResolvedValue([baseJobType]);
    // Act
    const res = await request(app)
      .get('/jobtypes')
      .set('Authorization', `Bearer ${generateToken('RECRUITER')}`);
    // Assert
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns 200 filtering by sectorId', async () => {
    // Arrange
    mockPrismaJobType.findMany.mockResolvedValue([baseJobType]);
    // Act
    const res = await request(app)
      .get('/jobtypes?sectorId=1')
      .set('Authorization', `Bearer ${generateToken('ADMIN')}`);
    // Assert
    expect(res.status).toBe(200);
  });

  it('returns 401 when no token is provided', async () => {
    // Act
    const res = await request(app).get('/jobtypes');
    // Assert
    expect(res.status).toBe(401);
  });
});

describe('POST /jobtypes', () => {
  it('returns 201 when ADMIN creates a job type', async () => {
    // Arrange
    mockPrismaSector.findUnique.mockResolvedValue(baseSector);
    mockPrismaJobType.findUnique.mockResolvedValue(null);
    mockPrismaJobType.create.mockResolvedValue(baseJobType);
    // Act
    const res = await request(app)
      .post('/jobtypes')
      .set('Authorization', `Bearer ${generateToken('ADMIN')}`)
      .send({ name: 'Backend Developer', sectorId: 1 });
    // Assert
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('name', 'Backend Developer');
  });

  it('returns 403 when RECRUITER tries to create a job type', async () => {
    // Act
    const res = await request(app)
      .post('/jobtypes')
      .set('Authorization', `Bearer ${generateToken('RECRUITER')}`)
      .send({ name: 'Backend Developer', sectorId: 1 });
    // Assert
    expect(res.status).toBe(403);
  });
});
