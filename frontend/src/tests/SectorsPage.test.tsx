import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SectorsPage } from '../pages/SectorsPage';
import { Sector } from '../types/sector.types';

// ── Mock useSectors hook ───────────────────────────────────────────────────────
const mockLoadSectors = jest.fn();
const mockCreateSector = jest.fn();
const mockUpdateSector = jest.fn();
const mockDeleteSector = jest.fn();
const mockFilterByName = jest.fn();

const sampleSectors: Sector[] = [
  { id: 1, name: 'Technology', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 2, name: 'Finance', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
];

jest.mock('../hooks/useSectors', () => ({
  useSectors: () => ({
    sectors: sampleSectors,
    loading: false,
    error: null,
    loadSectors: mockLoadSectors,
    createSector: mockCreateSector,
    updateSector: mockUpdateSector,
    deleteSector: mockDeleteSector,
    filterByName: mockFilterByName,
  }),
}));

// ── Mock SectorForm ────────────────────────────────────────────────────────────
jest.mock('../components/SectorForm', () => ({
  SectorForm: ({ sector, onCancel }: { sector?: Sector; onCancel: () => void }) => (
    <div data-testid="sector-form">
      {sector ? <span>Editing: {sector.name}</span> : <span>New sector form</span>}
      <button type="button" onClick={onCancel}>Cancelar</button>
    </div>
  ),
}));

describe('SectorsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadSectors.mockResolvedValue(undefined);
    mockFilterByName.mockImplementation(() => sampleSectors);
  });

  it('renders the table with sectors', async () => {
    // Arrange & Act
    render(<SectorsPage />);
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Finance')).toBeInTheDocument();
    });
  });

  it('renders filter input for Nombre column', () => {
    // Arrange & Act
    render(<SectorsPage />);
    // Assert
    const filterInputs = screen.getAllByPlaceholderText(/filtrar/i);
    expect(filterInputs.length).toBeGreaterThanOrEqual(1);
  });

  it('filters sectors by name when typing in filter input', async () => {
    // Arrange
    mockFilterByName.mockReturnValue([sampleSectors[0]]);
    render(<SectorsPage />);
    const filterInput = screen.getAllByPlaceholderText(/filtrar/i)[0];
    // Act
    fireEvent.change(filterInput, { target: { value: 'Tech' } });
    // Assert
    await waitFor(() => {
      expect(mockFilterByName).toHaveBeenCalledWith('Tech');
    });
  });

  it('opens SectorForm on Editar button click', async () => {
    // Arrange
    render(<SectorsPage />);
    // Act
    const editButtons = screen.getAllByRole('button', { name: /editar/i });
    fireEvent.click(editButtons[0]);
    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('sector-form')).toBeInTheDocument();
      expect(screen.getByText(/editing: technology/i)).toBeInTheDocument();
    });
  });

  it('opens SectorForm on double-click on a table row', async () => {
    // Arrange
    render(<SectorsPage />);
    // Act
    const techCell = screen.getByText('Technology');
    const row = techCell.closest('tr');
    expect(row).not.toBeNull();
    fireEvent.dblClick(row!);
    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('sector-form')).toBeInTheDocument();
    });
  });
});
