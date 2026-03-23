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

const baseSector = {
  id: 1,
  name: 'Technology',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env['JWT_SECRET'] = TEST_JWT_SECRET;
});

describe('GET /sectors', () => {
  it('returns 200 with sector list for authenticated user', async () => {
    // Arrange
    mockPrismaSector.findMany.mockResolvedValue([baseSector]);
    // Act
    const res = await request(app)
      .get('/sectors')
      .set('Authorization', `Bearer ${generateToken('RECRUITER')}`);
    // Assert
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns 401 when no token is provided', async () => {
    // Act
    const res = await request(app).get('/sectors');
    // Assert
    expect(res.status).toBe(401);
  });
});

describe('POST /sectors', () => {
  it('returns 201 when ADMIN creates a sector', async () => {
    // Arrange
    mockPrismaSector.findUnique.mockResolvedValue(null);
    mockPrismaSector.create.mockResolvedValue(baseSector);
    // Act
    const res = await request(app)
      .post('/sectors')
      .set('Authorization', `Bearer ${generateToken('ADMIN')}`)
      .send({ name: 'Technology' });
    // Assert
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('name', 'Technology');
  });

  it('returns 403 when RECRUITER tries to create a sector', async () => {
    // Act
    const res = await request(app)
      .post('/sectors')
      .set('Authorization', `Bearer ${generateToken('RECRUITER')}`)
      .send({ name: 'Technology' });
    // Assert
    expect(res.status).toBe(403);
  });

  it('returns 401 when no token is provided', async () => {
    // Act
    const res = await request(app).post('/sectors').send({ name: 'Technology' });
    // Assert
    expect(res.status).toBe(401);
  });

  it('returns 409 when sector name already exists', async () => {
    // Arrange
    mockPrismaSector.findUnique.mockResolvedValue(baseSector);
    // Act
    const res = await request(app)
      .post('/sectors')
      .set('Authorization', `Bearer ${generateToken('ADMIN')}`)
      .send({ name: 'Technology' });
    // Assert
    expect(res.status).toBe(409);
  });
});
