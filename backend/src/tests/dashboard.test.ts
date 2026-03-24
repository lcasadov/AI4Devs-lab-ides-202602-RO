import request from 'supertest';
import jwt from 'jsonwebtoken';

// ── Mock Prisma BEFORE importing the app ─────────────────────────────────────
const mockGroupBy = jest.fn();
const mockJobTypeFindMany = jest.fn();

jest.mock('../infrastructure/database/prisma-client', () => ({
  getPrismaClient: jest.fn(() => ({
    candidate: {
      groupBy: mockGroupBy,
    },
    jobType: {
      findMany: mockJobTypeFindMany,
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

// ── Silence console output during tests ──────────────────────────────────────
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  // Set JWT_SECRET so authMiddleware can verify tokens
  process.env['JWT_SECRET'] = 'test-secret-for-tests';
});

afterAll(() => {
  jest.restoreAllMocks();
});

import { app } from '../index';

// ── Auth helper ───────────────────────────────────────────────────────────────
const TEST_JWT_SECRET = 'test-secret-for-tests';
function recruiterToken(): string {
  return jwt.sign({ userId: 99, login: 'tester', role: 'RECRUITER' }, TEST_JWT_SECRET, { expiresIn: '1h' });
}

// ── GET /dashboard/stats ──────────────────────────────────────────────────────
describe('GET /dashboard/stats', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 without JWT', async () => {
    // Arrange — no auth header

    // Act
    const res = await request(app).get('/dashboard/stats');

    // Assert
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 200 with correct structure when data exists', async () => {
    // Arrange
    // groupBy for jobTypeId
    mockGroupBy.mockResolvedValueOnce([{ jobTypeId: 1, _count: { _all: 3 } }]);
    // jobType.findMany for names
    mockJobTypeFindMany.mockResolvedValueOnce([{ id: 1, name: 'Backend Developer' }]);
    // groupBy for province
    mockGroupBy.mockResolvedValueOnce([
      { province: 'Madrid', _count: { _all: 2 } },
      { province: null, _count: { _all: 1 } },
    ]);
    // groupBy for municipality
    mockGroupBy.mockResolvedValueOnce([{ municipality: null, _count: { _all: 3 } }]);

    // Act
    const res = await request(app)
      .get('/dashboard/stats')
      .set('Authorization', `Bearer ${recruiterToken()}`);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      byJobType: [{ name: 'Backend Developer', count: 3 }],
      byProvince: [{ name: 'Madrid', count: 2 }, { name: 'Sin provincia', count: 1 }],
      byMunicipality: [{ name: 'Sin municipio', count: 3 }],
    });
  });

  it('returns 200 with empty arrays when no candidates', async () => {
    // Arrange
    mockGroupBy.mockResolvedValueOnce([]); // jobTypeId groupBy
    mockJobTypeFindMany.mockResolvedValueOnce([]); // jobType names
    mockGroupBy.mockResolvedValueOnce([]); // province groupBy
    mockGroupBy.mockResolvedValueOnce([]); // municipality groupBy

    // Act
    const res = await request(app)
      .get('/dashboard/stats')
      .set('Authorization', `Bearer ${recruiterToken()}`);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      byJobType: [],
      byProvince: [],
      byMunicipality: [],
    });
  });
});
