import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { DashboardPage } from '../pages/DashboardPage';
import { DashboardStats } from '../services/dashboard.service';

// ── Mock useAuth ───────────────────────────────────────────────────────────────
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { login: 'admin', role: 'ADMIN' }, isAuthenticated: true, isAdmin: true }),
}));

// ── Mock getDashboardStats ────────────────────────────────────────────────────
const mockGetDashboardStats = jest.fn();
jest.mock('../services/dashboard.service', () => ({
  getDashboardStats: (...args: unknown[]) => mockGetDashboardStats(...args),
}));

// ── Sample data ───────────────────────────────────────────────────────────────
const sampleStats: DashboardStats = {
  byJobType: [{ name: 'Backend Developer', count: 3 }],
  byProvince: [{ name: 'Madrid', count: 2 }, { name: 'Sin provincia', count: 1 }],
  byMunicipality: [{ name: 'Madrid', count: 2 }, { name: 'Sin municipio', count: 1 }],
};

const emptyStats: DashboardStats = {
  byJobType: [],
  byProvince: [],
  byMunicipality: [],
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state while fetching', () => {
    // Arrange — never resolves
    mockGetDashboardStats.mockReturnValue(new Promise(() => undefined));

    // Act
    render(<DashboardPage />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows three panels with data when stats load', async () => {
    // Arrange
    mockGetDashboardStats.mockResolvedValue(sampleStats);

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Backend Developer')).toBeInTheDocument();
      expect(screen.getAllByText('Madrid').length).toBeGreaterThan(0);
    });

    // Panel titles
    expect(screen.getByText('Por Tipo de Puesto')).toBeInTheDocument();
    expect(screen.getByText('Por Provincia')).toBeInTheDocument();
    expect(screen.getByText('Por Municipio')).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    // Arrange
    mockGetDashboardStats.mockRejectedValue(new Error('Network error'));

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('renders empty panels without crashing when arrays are empty', async () => {
    // Arrange
    mockGetDashboardStats.mockResolvedValue(emptyStats);

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Por Tipo de Puesto')).toBeInTheDocument();
      expect(screen.getByText('Por Provincia')).toBeInTheDocument();
      expect(screen.getByText('Por Municipio')).toBeInTheDocument();
    });
    // No crash
  });
});
