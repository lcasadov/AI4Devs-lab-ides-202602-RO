import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CandidatesPage } from '../pages/CandidatesPage';
import { Candidate } from '../types/candidate';

// ── Mock useAuth ───────────────────────────────────────────────────────────────
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ token: 'test-token', isAdmin: false }),
}));

// ── Mock useCandidates hook ───────────────────────────────────────────────────
const mockHookState = {
  candidates: [] as Candidate[],
  isLoading: false,
  error: null as string | null,
  loadCandidates: jest.fn(),
  deleteCandidate: jest.fn(),
  createCandidate: jest.fn(),
  updateCandidate: jest.fn(),
  uploadCv: jest.fn(),
};

jest.mock('../hooks/useCandidates', () => ({
  useCandidates: () => mockHookState,
}));

// ── Mock sectorService and jobtypeService ─────────────────────────────────────
jest.mock('../services/sector.service', () => ({
  sectorService: { getAll: jest.fn().mockResolvedValue([]) },
}));

jest.mock('../services/jobtype.service', () => ({
  jobtypeService: { getAll: jest.fn().mockResolvedValue([]) },
}));

// ── Mock exportToExcel utility ────────────────────────────────────────────────
const mockExportToExcel = jest.fn();
jest.mock('../utils/exportExcel', () => ({
  exportToExcel: (...args: unknown[]) => mockExportToExcel(...args),
}));

// ── Mock CandidateForm ────────────────────────────────────────────────────────
jest.mock('../components/CandidateForm', () => ({
  CandidateForm: () => <div data-testid="candidate-form">CandidateForm</div>,
}));

// ── Sample data ───────────────────────────────────────────────────────────────
const sampleCandidates: Candidate[] = [
  {
    id: 1,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    phone: '+34612345678',
    address: undefined,
    postalCode: undefined,
    province: 'Madrid',
    municipality: 'Madrid',
    sectorId: undefined,
    jobTypeId: undefined,
    sector: null,
    jobType: null,
    education: null,
    workExperience: null,
    cvFileName: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

// ── Helper ────────────────────────────────────────────────────────────────────
function renderPage(): ReturnType<typeof render> {
  return render(
    <MemoryRouter>
      <CandidatesPage />
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('CandidatesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHookState.isLoading = false;
    mockHookState.candidates = [];
    mockHookState.error = null;
    mockHookState.loadCandidates.mockResolvedValue(undefined);
  });

  it('shows loading state when isLoading is true', () => {
    // Arrange
    mockHookState.isLoading = true;

    // Act
    renderPage();

    // Assert
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('shows candidates in table when data is loaded', () => {
    // Arrange
    mockHookState.candidates = sampleCandidates;

    // Act
    renderPage();

    // Assert
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('shows empty state when no candidates', () => {
    // Arrange
    mockHookState.candidates = [];

    // Act
    renderPage();

    // Assert
    expect(screen.getByText('No hay candidatos')).toBeInTheDocument();
  });

  it('shows CandidateForm when clicking new candidate button', () => {
    // Arrange
    renderPage();

    // Act
    fireEvent.click(screen.getByText('+ Nuevo candidato'));

    // Assert
    expect(screen.getByTestId('candidate-form')).toBeInTheDocument();
  });

  it('calls exportToExcel when clicking export button', () => {
    // Arrange
    mockHookState.candidates = sampleCandidates;
    renderPage();

    // Act
    fireEvent.click(screen.getByText('Exportar Excel'));

    // Assert
    expect(mockExportToExcel).toHaveBeenCalledTimes(1);
  });
});
