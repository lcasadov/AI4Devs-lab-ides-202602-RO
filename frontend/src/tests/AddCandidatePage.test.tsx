import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddCandidatePage } from '../pages/AddCandidatePage';

// ── Mock react-router-dom ─────────────────────────────────────────────────────
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

// ── Mock CandidateForm ───────────────────────────────────────────────────────
// Capture the onSuccess callback so tests can trigger it
let capturedOnSuccess: (() => void) | undefined;

jest.mock('../components/CandidateForm', () => ({
  CandidateForm: ({ onSuccess }: { onSuccess: () => void }) => {
    capturedOnSuccess = onSuccess;
    return (
      <form data-testid="candidate-form">
        <button type="button" onClick={onSuccess}>
          Simulate Success
        </button>
      </form>
    );
  },
}));

// ── Tests ────────────────────────────────────────────────────────────────────
describe('AddCandidatePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedOnSuccess = undefined;
  });

  it('renders the CandidateForm component', () => {
    // Arrange & Act
    render(<AddCandidatePage />);

    // Assert
    expect(screen.getByTestId('candidate-form')).toBeInTheDocument();
  });

  it('shows "Candidato añadido correctamente" after a successful submission', async () => {
    // Arrange
    render(<AddCandidatePage />);

    // Act – trigger the success callback that was passed to CandidateForm
    fireEvent.click(screen.getByText('Simulate Success'));

    // Assert
    expect(
      await screen.findByText(/candidato añadido correctamente/i)
    ).toBeInTheDocument();
  });
});
