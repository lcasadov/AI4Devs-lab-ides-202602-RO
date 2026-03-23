import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UsersPage } from '../pages/UsersPage';
import { User } from '../types/user.types';

// ── Mock useUsers hook ────────────────────────────────────────────────────────
const mockLoadUsers = jest.fn();
const mockCreateUser = jest.fn();
const mockUpdateUser = jest.fn();
const mockDeleteUser = jest.fn();
const mockResetUserPassword = jest.fn();
const mockSetFilters = jest.fn();

const sampleUsers: User[] = [
  {
    id: 1,
    login: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    role: 'ADMIN',
    active: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    login: 'recruiter',
    firstName: 'Recruiter',
    lastName: 'Person',
    email: 'recruiter@example.com',
    role: 'RECRUITER',
    active: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

jest.mock('../hooks/useUsers', () => ({
  useUsers: () => ({
    users: sampleUsers,
    loading: false,
    error: null,
    filters: {},
    selectedUser: null,
    loadUsers: mockLoadUsers,
    createUser: mockCreateUser,
    updateUser: mockUpdateUser,
    deleteUser: mockDeleteUser,
    resetUserPassword: mockResetUserPassword,
    setFilters: mockSetFilters,
    selectUser: jest.fn(),
  }),
}));

// ── Mock UserForm ─────────────────────────────────────────────────────────────
jest.mock('../components/UserForm', () => ({
  UserForm: ({ user, onCancel }: { user?: User; onCancel: () => void }) => (
    <div data-testid="user-form">
      {user ? <span>Editing: {user.login}</span> : <span>New user form</span>}
      <button type="button" onClick={onCancel}>
        Cancelar
      </button>
    </div>
  ),
}));

// ── Tests ──────────────────────────────────────────────────────────────────────
describe('UsersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadUsers.mockResolvedValue(undefined);
  });

  it('renders the table with users', async () => {
    // Arrange & Act
    render(<UsersPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('recruiter')).toBeInTheDocument();
    });
  });

  it('renders filter inputs for each column', () => {
    // Arrange & Act
    render(<UsersPage />);

    // Assert — there are filter inputs in the table header
    const filterInputs = screen.getAllByPlaceholderText(/filtrar/i);
    expect(filterInputs.length).toBeGreaterThanOrEqual(4); // login, nombre, apellidos, email
  });

  it('opens the UserForm when Editar button is clicked', async () => {
    // Arrange
    render(<UsersPage />);

    // Act
    const editButtons = screen.getAllByRole('button', { name: /editar/i });
    fireEvent.click(editButtons[0]); // click first edit button

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('user-form')).toBeInTheDocument();
      expect(screen.getByText(/editing: admin/i)).toBeInTheDocument();
    });
  });

  it('opens the UserForm on double-click on a table row', async () => {
    // Arrange
    render(<UsersPage />);

    // Find a table row that contains user data and double-click it
    const adminCell = screen.getByText('admin');
    const row = adminCell.closest('tr');
    expect(row).not.toBeNull();

    // Act
    fireEvent.dblClick(row!);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('user-form')).toBeInTheDocument();
      expect(screen.getByText(/editing: admin/i)).toBeInTheDocument();
    });
  });
});
