import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '../pages/LoginPage';
import { AuthUser } from '../types/auth.types';

// ── Mock react-router-dom ──────────────────────────────────────────────────────
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// ── Mock AuthContext ───────────────────────────────────────────────────────────
const mockLogin = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: jest.fn(),
    user: null,
    token: null,
    isAuthenticated: false,
    isAdmin: false,
  }),
}));

// ── Mock authService ───────────────────────────────────────────────────────────
jest.mock('../services/auth.service', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    changePassword: jest.fn(),
    getToken: jest.fn(),
    getStoredUser: jest.fn(),
  },
}));

import { authService } from '../services/auth.service';

const mockedAuthService = authService as jest.Mocked<typeof authService>;

// ── Shared fixtures ────────────────────────────────────────────────────────────
const authUser: AuthUser = {
  id: 1,
  login: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@example.com',
  role: 'ADMIN',
  active: true,
};

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with login and password fields', () => {
    // Arrange & Act
    render(<LoginPage />);

    // Assert
    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /acceder/i })).toBeInTheDocument();
  });

  it('shows a generic error when login fails', async () => {
    // Arrange
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));
    render(<LoginPage />);

    // Act
    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /acceder/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('alert').textContent).toMatch(/no son correctos/i);
    });
  });

  it('calls useAuth login with form data on submit', async () => {
    // Arrange
    mockLogin.mockResolvedValue({ token: 'fake-token', user: authUser });
    render(<LoginPage />);

    // Act
    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'ValidPass@1' } });
    fireEvent.click(screen.getByRole('button', { name: /acceder/i }));

    // Assert
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ login: 'admin', password: 'ValidPass@1' });
    });
  });

  it('shows forgot-password message when the link is clicked', async () => {
    // Arrange
    mockedAuthService.forgotPassword.mockResolvedValue(undefined);
    render(<LoginPage />);

    // Fill in login so the forgot-password handler does not show a validation error
    fireEvent.change(screen.getByLabelText(/usuario/i), { target: { value: 'admin' } });

    // Act
    fireEvent.click(screen.getByRole('button', { name: /olvidaste/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByRole('status').textContent).toMatch(/si el usuario existe/i);
    });
  });
});
