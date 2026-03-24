import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CandidateForm } from '../components/CandidateForm';

// ── Mock useAuth ─────────────────────────────────────────────────────────────
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ token: 'test-token' }),
}));

// ── Mock sectorService ───────────────────────────────────────────────────────
jest.mock('../services/sector.service', () => ({
  sectorService: {
    getAll: jest.fn().mockResolvedValue([]),
  },
}));

// ── Mock jobtypeService ──────────────────────────────────────────────────────
jest.mock('../services/jobtype.service', () => ({
  jobtypeService: {
    getAll: jest.fn().mockResolvedValue([]),
  },
}));

// ── Mock candidateService ────────────────────────────────────────────────────
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockUploadCv = jest.fn();

jest.mock('../services/candidate.service', () => ({
  candidateService: {
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    uploadCv: (...args: unknown[]) => mockUploadCv(...args),
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
function renderForm(onSuccess = jest.fn(), onCancel = jest.fn()) {
  return render(<CandidateForm onSuccess={onSuccess} onCancel={onCancel} />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('CandidateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders basic required fields', () => {
    // Arrange & Act
    renderForm();

    // Assert
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
  });

  it('renders Guardar and Cancelar buttons', () => {
    // Arrange & Act
    renderForm();

    // Assert
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('shows "El nombre es requerido" when firstName is empty on submit', async () => {
    // Arrange
    renderForm();

    // Act – submit without filling fields
    fireEvent.submit(screen.getByRole('button', { name: /guardar/i }).closest('form')!);

    // Assert
    expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument();
  });

  it('shows email format error when email is invalid on submit', async () => {
    // Arrange
    renderForm();
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/apellido/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'not-an-email');

    // Act
    fireEvent.submit(screen.getByRole('button', { name: /guardar/i }).closest('form')!);

    // Assert
    expect(await screen.findByText('El formato del email no es válido')).toBeInTheDocument();
  });

  it('shows phone format error when phone is invalid', async () => {
    // Arrange
    renderForm();
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/apellido/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/teléfono/i), '123456789');

    // Act
    fireEvent.submit(screen.getByRole('button', { name: /guardar/i }).closest('form')!);

    // Assert
    expect(await screen.findByText(/\+34XXXXXXXXX/)).toBeInTheDocument();
  });

  it('calls candidateService.create and onSuccess on valid submission', async () => {
    // Arrange
    mockCreate.mockResolvedValue({
      id: 1,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
    const onSuccess = jest.fn();
    render(<CandidateForm onSuccess={onSuccess} onCancel={jest.fn()} />);

    await userEvent.type(screen.getByLabelText(/nombre/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/apellido/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');

    // Act
    fireEvent.submit(screen.getByRole('button', { name: /guardar/i }).closest('form')!);

    // Assert
    await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it('shows a general error alert when candidateService.create rejects', async () => {
    // Arrange
    mockCreate.mockRejectedValue(new Error('Este email ya está registrado'));
    renderForm();

    await userEvent.type(screen.getByLabelText(/nombre/i), 'Jane');
    await userEvent.type(screen.getByLabelText(/apellido/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');

    // Act
    fireEvent.submit(screen.getByRole('button', { name: /guardar/i }).closest('form')!);

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('Este email ya está registrado');
  });

  it('calls onCancel when Cancelar button is clicked', () => {
    // Arrange
    const onCancel = jest.fn();
    render(<CandidateForm onSuccess={jest.fn()} onCancel={onCancel} />);

    // Act
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    // Assert
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not show CV upload section in create mode', () => {
    // Arrange & Act
    renderForm();

    // Assert – no CV section in create mode
    expect(screen.queryByText(/subir cv/i)).not.toBeInTheDocument();
  });
});
