import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JobTypesPage } from '../pages/JobTypesPage';
import { JobType } from '../types/jobtype.types';
import { Sector } from '../types/sector.types';

// ── Mock useJobTypes hook ──────────────────────────────────────────────────────
const mockLoadJobTypes = jest.fn();
const mockCreateJobType = jest.fn();
const mockUpdateJobType = jest.fn();
const mockDeleteJobType = jest.fn();

const sampleJobTypes: JobType[] = [
  {
    id: 1,
    name: 'Backend Developer',
    sectorId: 1,
    sector: { id: 1, name: 'Technology' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Financial Analyst',
    sectorId: 2,
    sector: { id: 2, name: 'Finance' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

jest.mock('../hooks/useJobTypes', () => ({
  useJobTypes: () => ({
    jobTypes: sampleJobTypes,
    loading: false,
    error: null,
    loadJobTypes: mockLoadJobTypes,
    createJobType: mockCreateJobType,
    updateJobType: mockUpdateJobType,
    deleteJobType: mockDeleteJobType,
  }),
}));

// ── Mock sector service ────────────────────────────────────────────────────────
const sampleSectors: Sector[] = [
  { id: 1, name: 'Technology', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 2, name: 'Finance', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
];

jest.mock('../services/sector.service', () => ({
  sectorService: {
    getAll: jest.fn().mockResolvedValue(sampleSectors),
  },
}));

// ── Mock JobTypeForm ───────────────────────────────────────────────────────────
jest.mock('../components/JobTypeForm', () => ({
  JobTypeForm: ({ jobType, onCancel }: { jobType?: JobType; onCancel: () => void }) => (
    <div data-testid="jobtype-form">
      {jobType ? <span>Editing: {jobType.name}</span> : <span>New job type form</span>}
      <button type="button" onClick={onCancel}>Cancelar</button>
    </div>
  ),
}));

describe('JobTypesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadJobTypes.mockResolvedValue(undefined);
  });

  it('renders the table with job types', async () => {
    // Arrange & Act
    render(<JobTypesPage />);
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Backend Developer')).toBeInTheDocument();
      expect(screen.getByText('Financial Analyst')).toBeInTheDocument();
    });
  });

  it('renders sector filter combo', () => {
    // Arrange & Act
    render(<JobTypesPage />);
    // Assert — the "Todos" option should be present in the sector filter
    const todosOptions = screen.getAllByText('Todos');
    expect(todosOptions.length).toBeGreaterThanOrEqual(1);
  });

  it('filters by sector when selecting from the combo', async () => {
    // Arrange
    render(<JobTypesPage />);
    // Wait for sector options to load into the select (async sectorService.getAll)
    await waitFor(() => {
      // role 'option' finds <option> elements inside selects only
      expect(screen.getAllByRole('option', { name: 'Technology' }).length).toBeGreaterThan(0);
    });
    // Act — find the sector filter select (it will have the 'Technology' option)
    const comboboxes = screen.getAllByRole('combobox');
    const sectorSelect = comboboxes.find(
      (cb) => cb.querySelector('option[value="1"]') !== null,
    )!;
    fireEvent.change(sectorSelect, { target: { value: '1' } });
    // Assert
    await waitFor(() => {
      expect(mockLoadJobTypes).toHaveBeenCalledWith(expect.objectContaining({ sectorId: 1 }));
    });
  });

  it('opens JobTypeForm on Editar button click', async () => {
    // Arrange
    render(<JobTypesPage />);
    await waitFor(() => screen.getByText('Backend Developer'));
    // Act
    const editButtons = screen.getAllByRole('button', { name: /editar/i });
    fireEvent.click(editButtons[0]);
    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('jobtype-form')).toBeInTheDocument();
    });
  });
});
