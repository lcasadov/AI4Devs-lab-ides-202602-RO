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

// ── Shared fixtures ────────────────────────────────────────────────────────────
const validUserWithHash = {
  id: 1,
  login: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@example.com',
  passwordHash: '$2b$12$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  role: 'ADMIN',
  active: true,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

function generateToken(payload: { userId: number; login: string; role: string }): string {
  return jwt.sign(payload, TEST_JWT_SECRET, { expiresIn: '1h' });
}

// ── POST /auth/login ──────────────────────────────────────────────────────────
describe('POST /auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env['JWT_SECRET'] = TEST_JWT_SECRET;
    process.env['JWT_EXPIRES_IN'] = '1h';
  });

  it('returns 200 with { token, user } when credentials are correct', async () => {
    // Arrange — mock findByLogin to return a user, then comparePassword to pass
    // We need bcrypt to succeed, so we use a pre-hashed known value
    // Instead, mock at a higher level by returning a valid bcrypt hash
    // Actually we mock the whole bcrypt module
    const bcrypt = await import('bcrypt');
    const realHash = await bcrypt.hash('ValidPass@1', 1); // low rounds for test speed
    mockPrismaUser.findUnique.mockResolvedValue({ ...validUserWithHash, passwordHash: realHash });

    // Act
    const res = await request(app)
      .post('/auth/login')
      .send({ login: 'admin', password: 'ValidPass@1' });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).not.toHaveProperty('passwordHash');
    expect(res.body.user.login).toBe('admin');
  });

  it('returns 401 when credentials are incorrect', async () => {
    // Arrange
    const bcrypt = await import('bcrypt');
    const realHash = await bcrypt.hash('CorrectPass@1', 1);
    mockPrismaUser.findUnique.mockResolvedValue({ ...validUserWithHash, passwordHash: realHash });

    // Act
    const res = await request(app)
      .post('/auth/login')
      .send({ login: 'admin', password: 'WrongPass@1' });

    // Assert
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when body is empty', async () => {
    // Arrange — no mock needed, validation fires before any DB call

    // Act
    const res = await request(app).post('/auth/login').send({});

    // Assert
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

// ── POST /auth/forgot-password ────────────────────────────────────────────────
describe('POST /auth/forgot-password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env['JWT_SECRET'] = TEST_JWT_SECRET;
  });

  it('always returns 200 when user exists', async () => {
    // Arrange
    const bcrypt = await import('bcrypt');
    const realHash = await bcrypt.hash('SomePass@1', 1);
    mockPrismaUser.findUnique.mockResolvedValue({ ...validUserWithHash, passwordHash: realHash });
    mockPrismaUser.update.mockResolvedValue(validUserWithHash);

    // Act
    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ login: 'admin' });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('always returns 200 when user does NOT exist (silent)', async () => {
    // Arrange
    mockPrismaUser.findUnique.mockResolvedValue(null);

    // Act
    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ login: 'nonexistent' });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});

// ── PUT /auth/change-password ──────────────────────────────────────────────────
describe('PUT /auth/change-password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env['JWT_SECRET'] = TEST_JWT_SECRET;
  });

  it('returns 401 when no token is provided', async () => {
    // Arrange — no token

    // Act
    const res = await request(app)
      .put('/auth/change-password')
      .send({ currentPassword: 'Old@1', newPassword: 'New@Pass1', confirmPassword: 'New@Pass1' });

    // Assert
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 200 when password is changed successfully', async () => {
    // Arrange
    const bcrypt = await import('bcrypt');
    const currentHash = await bcrypt.hash('CurrentPass@1', 1);
    mockPrismaUser.findUnique.mockResolvedValue({ ...validUserWithHash, passwordHash: currentHash });
    mockPrismaUser.update.mockResolvedValue(validUserWithHash);

    const token = generateToken({ userId: 1, login: 'admin', role: 'ADMIN' });

    // Act
    const res = await request(app)
      .put('/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'CurrentPass@1',
        newPassword: 'NewPass@1',
        confirmPassword: 'NewPass@1',
      });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
