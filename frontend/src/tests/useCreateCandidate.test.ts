import { renderHook, act } from '@testing-library/react';
import { useCreateCandidate } from '../hooks/useCreateCandidate';
import { candidateService } from '../services/candidate.service';
import { Candidate, CreateCandidateFormData } from '../types/candidate';

// ── Mock candidateService ────────────────────────────────────────────────────
jest.mock('../services/candidate.service', () => ({
  candidateService: {
    create: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
  },
}));

const mockedCreate = candidateService.create as jest.MockedFunction<typeof candidateService.create>;

// ── Shared fixtures ──────────────────────────────────────────────────────────
const baseDto: CreateCandidateFormData = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
};

const createdCandidate: Candidate = {
  id: 1,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

// ── Tests ────────────────────────────────────────────────────────────────────
describe('useCreateCandidate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has initial state: isLoading false, error null, success false', () => {
    // Arrange & Act
    const { result } = renderHook(() => useCreateCandidate());

    // Assert
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
  });

  it('sets success true and isLoading false and error null after a successful create', async () => {
    // Arrange
    mockedCreate.mockResolvedValue(createdCandidate);
    const { result } = renderHook(() => useCreateCandidate());

    // Act
    await act(async () => {
      await result.current.createCandidate(baseDto);
    });

    // Assert
    expect(result.current.success).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error message, isLoading false and success false after a failed create', async () => {
    // Arrange
    mockedCreate.mockRejectedValue(new Error('Este email ya está registrado'));
    const { result } = renderHook(() => useCreateCandidate());

    // Act
    await act(async () => {
      await result.current.createCandidate(baseDto);
    });

    // Assert
    expect(result.current.error).toBe('Este email ya está registrado');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.success).toBe(false);
  });
});
