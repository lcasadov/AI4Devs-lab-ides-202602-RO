import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CandidateForm } from '../components/CandidateForm';

// ── Mock useCreateCandidate ──────────────────────────────────────────────────
const mockCreateCandidate = jest.fn();

let mockIsLoading = false;
let mockError: string | null = null;
let mockSuccess = false;

jest.mock('../hooks/useCreateCandidate', () => ({
  useCreateCandidate: () => ({
    isLoading: mockIsLoading,
    error: mockError,
    success: mockSuccess,
    createCandidate: mockCreateCandidate,
  }),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────
function renderForm(onSuccess = jest.fn()) {
  return render(<CandidateForm onSuccess={onSuccess} />);
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe('CandidateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLoading = false;
    mockError = null;
    mockSuccess = false;
  });

  it('renders all form fields', () => {
    // Arrange & Act
    renderForm();

    // Assert
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/educación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/experiencia laboral/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cv/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /añadir candidato/i })).toBeInTheDocument();
  });

  it('shows "El nombre es requerido" when firstName is empty on submit', async () => {
    // Arrange
    renderForm();
    const form = screen.getByRole('button', { name: /añadir candidato/i }).closest('form')!;

    // Act – submit without filling firstName
    fireEvent.submit(form);

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
    fireEvent.submit(screen.getByRole('button', { name: /añadir candidato/i }).closest('form')!);

    // Assert
    expect(await screen.findByText('El formato del email no es válido')).toBeInTheDocument();
  });

  it('disables the submit button while isLoading is true', () => {
    // Arrange
    mockIsLoading = true;

    // Act
    renderForm();

    // Assert
    expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled();
  });

  it('calls onSuccess when success changes to true', async () => {
    // Arrange
    const onSuccess = jest.fn();
    mockSuccess = true;

    // Act
    render(<CandidateForm onSuccess={onSuccess} />);

    // Assert – useEffect fires synchronously in the render cycle
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it('shows a general error alert when error is not null', () => {
    // Arrange
    mockError = 'Este email ya está registrado';

    // Act
    renderForm();

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Este email ya está registrado');
  });
});
