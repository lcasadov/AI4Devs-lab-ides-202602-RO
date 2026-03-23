import request from 'supertest';
import jwt from 'jsonwebtoken';

// ── Mock Prisma BEFORE importing the app ──────────────────────────────────────
const mockPrismaUser = {
  findUnique: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../infrastructure/database/prisma-client', () => ({
  getPrismaClient: jest.fn(() => ({
    user: mockPrismaUser,
    candidate: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  })),
}));

// ── Mock EmailService ──────────────────────────────────────────────────────────
const mockEmailSend = jest.fn().mockResolvedValue(undefined);
jest.mock('../infrastructure/services/EmailService', () => ({
  getEmailService: jest.fn(() => ({ send: mockEmailSend })),
}));

// ── Silence console output ────────────────────────────────────────────────────
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterAll(() => {
  jest.restoreAllMocks();
});

import { app } from '../index';

const TEST_JWT_SECRET = 'test-secret-for-tests';

// ── Token factory ──────────────────────────────────────────────────────────────
function generateToken(payload: { userId: number; login: string; role: string }): string {
  return jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: '1h' });
}

// ── Shared fixtures ────────────────────────────────────────────────────────────
const adminUser = {
  id: 1,
  login: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@example.com',
  role: 'ADMIN',
  active: true,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

const recruiterUser = {
  id: 2,
  login: 'recruiter',
  firstName: 'Recruiter',
  lastName: 'User',
  email: 'recruiter@example.com',
  role: 'RECRUITER',
  active: true,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

const adminToken = generateToken({ userId: 1, login: 'admin', role: 'ADMIN' });
const recruiterToken = generateToken({ userId: 2, login: 'recruiter', role: 'RECRUITER' });

// ── GET /users ────────────────────────────────────────────────────────────────
describe('GET /users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env['JWT_SECRET'] = TEST_JWT_SECRET;
  });

  it('returns 401 when no token is provided', async () => {
    // Arrange — no token

    // Act
    const res = await request(app).get('/users');

    // Assert
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 403 when token belongs to a RECRUITER', async () => {
    // Arrange — recruiter token

    // Act
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${recruiterToken}`);

    // Assert
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 200 with array of users when token belongs to an ADMIN', async () => {
    // Arrange
    mockPrismaUser.findMany.mockResolvedValue([adminUser]);

    // Act
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);

    // Assert
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toMatchObject({ login: 'admin', role: 'ADMIN' });
    expect(res.body[0]).not.toHaveProperty('passwordHash');
  });
});

// ── POST /users ───────────────────────────────────────────────────────────────
describe('POST /users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env['JWT_SECRET'] = TEST_JWT_SECRET;
  });

  it('returns 201 with created user when ADMIN sends valid body', async () => {
    // Arrange
    mockPrismaUser.findUnique.mockResolvedValue(null); // no duplicates
    mockPrismaUser.create.mockResolvedValue(recruiterUser);

    // Act
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        login: 'recruiter',
        firstName: 'Recruiter',
        lastName: 'User',
        email: 'recruiter@example.com',
        role: 'RECRUITER',
      });

    // Assert
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ login: 'recruiter', role: 'RECRUITER' });
  });

  it('returns 409 when login is already in use', async () => {
    // Arrange — findUnique returns existing user for login check
    mockPrismaUser.findUnique.mockResolvedValue(adminUser);

    // Act
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        login: 'admin', // duplicate login
        firstName: 'Another',
        lastName: 'User',
        email: 'another@example.com',
        role: 'RECRUITER',
      });

    // Assert
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/admin/);
  });
});

// ── DELETE /users/:id ─────────────────────────────────────────────────────────
describe('DELETE /users/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env['JWT_SECRET'] = TEST_JWT_SECRET;
  });

  it('returns 204 when ADMIN deletes another user', async () => {
    // Arrange
    mockPrismaUser.findUnique.mockResolvedValue(recruiterUser); // target user exists
    mockPrismaUser.delete.mockResolvedValue(recruiterUser);

    // Act
    const res = await request(app)
      .delete(`/users/${recruiterUser.id}`)
      .set('Authorization', `Bearer ${adminToken}`); // admin (id=1) deletes user id=2

    // Assert
    expect(res.status).toBe(204);
  });

  it('returns 400 when ADMIN tries to delete their own account', async () => {
    // Arrange — no DB mock needed, CannotDeleteSelfError fires first

    // Act
    const res = await request(app)
      .delete(`/users/1`) // admin (id=1) tries to delete themselves
      .set('Authorization', `Bearer ${adminToken}`);

    // Assert
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/cannot delete/i);
  });
});
