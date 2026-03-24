import request from 'supertest';
import jwt from 'jsonwebtoken';

// ── Mock Prisma BEFORE importing the app ─────────────────────────────────────
const mockPrismaCandidate = {
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../infrastructure/database/prisma-client', () => ({
  getPrismaClient: jest.fn(() => ({
    candidate: mockPrismaCandidate,
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

// ── Auth helper — candidates route requires JWT since OWASP hardening ─────────
const TEST_JWT_SECRET = 'test-secret-for-tests';
function recruiterToken(): string {
  return jwt.sign({ userId: 99, login: 'tester', role: 'RECRUITER' }, TEST_JWT_SECRET, { expiresIn: '1h' });
}

// ── Shared test data ──────────────────────────────────────────────────────────
const validCandidate = {
  id: 1,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  phone: null,
  address: null,
  education: null,
  workExperience: null,
  cvFileName: null,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

// ── POST /candidates ──────────────────────────────────────────────────────────
describe('POST /candidates', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 201 with the created candidate', async () => {
    // Arrange
    mockPrismaCandidate.findUnique.mockResolvedValue(null); // no duplicate
    mockPrismaCandidate.create.mockResolvedValue(validCandidate);

    // Act
    const res = await request(app)
      .post('/candidates')
      .set('Authorization', `Bearer ${recruiterToken()}`)
      .field('firstName', 'Jane')
      .field('lastName', 'Doe')
      .field('email', 'jane.doe@example.com');

    // Assert
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com' });
  });

  it('returns 400 when firstName is missing', async () => {
    // Arrange – no mock needed (validation fires before DB)

    // Act
    const res = await request(app)
      .post('/candidates')
      .set('Authorization', `Bearer ${recruiterToken()}`)
      .field('lastName', 'Doe')
      .field('email', 'jane.doe@example.com');

    // Assert
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/firstName/i);
  });

  it('returns 400 when lastName is missing', async () => {
    // Arrange – no mock needed

    // Act
    const res = await request(app)
      .post('/candidates')
      .set('Authorization', `Bearer ${recruiterToken()}`)
      .field('firstName', 'Jane')
      .field('email', 'jane.doe@example.com');

    // Assert
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/lastName/i);
  });

  it('returns 400 when email is missing', async () => {
    // Arrange – no mock needed

    // Act
    const res = await request(app)
      .post('/candidates')
      .set('Authorization', `Bearer ${recruiterToken()}`)
      .field('firstName', 'Jane')
      .field('lastName', 'Doe');

    // Assert
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/email/i);
  });

  it('returns 409 when email is already in use', async () => {
    // Arrange
    mockPrismaCandidate.findUnique.mockResolvedValue(validCandidate); // duplicate found

    // Act
    const res = await request(app)
      .post('/candidates')
      .set('Authorization', `Bearer ${recruiterToken()}`)
      .field('firstName', 'Jane')
      .field('lastName', 'Doe')
      .field('email', 'jane.doe@example.com');

    // Assert
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/already in use/i);
  });

  it('returns 500 without exposing internal Prisma error details when DB fails', async () => {
    // Arrange
    mockPrismaCandidate.findUnique.mockRejectedValue(
      new Error('PrismaClientKnownRequestError: P2002 unique constraint failed on the fields: (`email`)')
    );

    // Act
    const res = await request(app)
      .post('/candidates')
      .set('Authorization', `Bearer ${recruiterToken()}`)
      .field('firstName', 'Jane')
      .field('lastName', 'Doe')
      .field('email', 'jane.doe@example.com');

    // Assert
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Internal server error');
    expect(res.body.error).not.toMatch(/prisma/i);
    expect(res.body.error).not.toMatch(/P2002/i);
  });
});

// ── GET /candidates ───────────────────────────────────────────────────────────
describe('GET /candidates', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with a list of candidates', async () => {
    // Arrange
    mockPrismaCandidate.findMany.mockResolvedValue([validCandidate]);

    // Act
    const res = await request(app)
      .get('/candidates')
      .set('Authorization', `Bearer ${recruiterToken()}`);

    // Assert
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ firstName: 'Jane', email: 'jane.doe@example.com' });
  });

  it('returns 200 with an empty array when there are no candidates', async () => {
    // Arrange
    mockPrismaCandidate.findMany.mockResolvedValue([]);

    // Act
    const res = await request(app)
      .get('/candidates')
      .set('Authorization', `Bearer ${recruiterToken()}`);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 500 without exposing details when DB fails', async () => {
    // Arrange
    mockPrismaCandidate.findMany.mockRejectedValue(new Error('DB connection lost'));

    // Act
    const res = await request(app)
      .get('/candidates')
      .set('Authorization', `Bearer ${recruiterToken()}`);

    // Assert
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Internal server error');
    expect(res.body.error).not.toMatch(/DB connection/i);
  });
});

// ── GET /candidates/:id ───────────────────────────────────────────────────────
describe('GET /candidates/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with the candidate when found', async () => {
    // Arrange
    mockPrismaCandidate.findUnique.mockResolvedValue(validCandidate);

    // Act
    const res = await request(app)
      .get('/candidates/1')
      .set('Authorization', `Bearer ${recruiterToken()}`);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, firstName: 'Jane', email: 'jane.doe@example.com' });
  });

  it('returns 404 when candidate is not found', async () => {
    // Arrange
    mockPrismaCandidate.findUnique.mockResolvedValue(null);

    // Act
    const res = await request(app)
      .get('/candidates/999')
      .set('Authorization', `Bearer ${recruiterToken()}`);

    // Assert
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/not found/i);
  });

  it('returns 500 without exposing details when DB fails', async () => {
    // Arrange
    mockPrismaCandidate.findUnique.mockRejectedValue(new Error('DB timeout'));

    // Act
    const res = await request(app)
      .get('/candidates/1')
      .set('Authorization', `Bearer ${recruiterToken()}`);

    // Assert
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Internal server error');
    expect(res.body.error).not.toMatch(/DB timeout/i);
  });
});

// ── PUT /candidates/:id ───────────────────────────────────────────────────────
describe('PUT /candidates/:id', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with the updated candidate', async () => {
    // Arrange — findUnique returns existing, update returns updated
    const updated = { ...validCandidate, firstName: 'John', province: 'Madrid' };
    mockPrismaCandidate.findUnique.mockResolvedValue(validCandidate);
    mockPrismaCandidate.update.mockResolvedValue(updated);

    // Act
    const res = await request(app)
      .put('/candidates/1')
      .set('Authorization', `Bearer ${recruiterToken()}`)
      .send({ firstName: 'John', province: 'Madrid' });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ firstName: 'John', province: 'Madrid' });
  });

  it('returns 404 when candidate does not exist', async () => {
    // Arrange
    mockPrismaCandidate.findUnique.mockResolvedValue(null);

    // Act
    const res = await request(app)
      .put('/candidates/999')
      .set('Authorization', `Bearer ${recruiterToken()}`)
      .send({ firstName: 'John' });

    // Assert
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/not found/i);
  });

  it('returns 409 when changing to an email already used by another candidate', async () => {
    // Arrange — first findUnique (by id) returns existing, second (by email) returns another candidate
    const anotherCandidate = { ...validCandidate, id: 2, email: 'other@example.com' };
    mockPrismaCandidate.findUnique
      .mockResolvedValueOnce(validCandidate)    // findById
      .mockResolvedValueOnce(anotherCandidate); // findByEmail

    // Act
    const res = await request(app)
      .put('/candidates/1')
      .set('Authorization', `Bearer ${recruiterToken()}`)
      .send({ email: 'other@example.com' });

    // Assert
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/already in use/i);
  });

  it('returns 400 when phone format is invalid', async () => {
    // Act
    const res = await request(app)
      .put('/candidates/1')
      .set('Authorization', `Bearer ${recruiterToken()}`)
      .send({ phone: '123456789' }); // missing +34

    // Assert
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

// ── POST /candidates/:id/cv ───────────────────────────────────────────────────
describe('POST /candidates/:id/cv', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 with updated candidate on valid PDF upload', async () => {
    // Arrange
    const updated = { ...validCandidate, cvFileName: '1-1234567890.pdf' };
    mockPrismaCandidate.findUnique.mockResolvedValue(validCandidate);
    mockPrismaCandidate.update.mockResolvedValue(updated);

    // Act
    const res = await request(app)
      .post('/candidates/1/cv')
      .set('Authorization', `Bearer ${recruiterToken()}`)
      .attach('cv', Buffer.from('%PDF fake pdf content'), { filename: 'test.pdf', contentType: 'application/pdf' });

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cvFileName');
  });

  it('returns 400 when file type is not PDF or DOCX', async () => {
    // Act
    const res = await request(app)
      .post('/candidates/1/cv')
      .set('Authorization', `Bearer ${recruiterToken()}`)
      .attach('cv', Buffer.from('fake image'), { filename: 'photo.jpg', contentType: 'image/jpeg' });

    // Assert
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/PDF and DOCX/i);
  });

  it('returns 400 when no file is uploaded', async () => {
    // Arrange
    mockPrismaCandidate.findUnique.mockResolvedValue(validCandidate);

    // Act
    const res = await request(app)
      .post('/candidates/1/cv')
      .set('Authorization', `Bearer ${recruiterToken()}`);

    // Assert
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 404 when candidate does not exist', async () => {
    // Arrange
    mockPrismaCandidate.findUnique.mockResolvedValue(null);

    // Act
    const res = await request(app)
      .post('/candidates/999/cv')
      .set('Authorization', `Bearer ${recruiterToken()}`)
      .attach('cv', Buffer.from('%PDF fake pdf content'), { filename: 'test.pdf', contentType: 'application/pdf' });

    // Assert
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/not found/i);
  });
});
