import { useState, useCallback } from 'react';
import { Sector, CreateSectorRequest, UpdateSectorRequest } from '../types/sector.types';
import { sectorService } from '../services/sector.service';

interface UseSectorsState {
  sectors: Sector[];
  loading: boolean;
  error: string | null;
}

export function useSectors(): UseSectorsState & {
  loadSectors: () => Promise<void>;
  createSector: (dto: CreateSectorRequest) => Promise<void>;
  updateSector: (id: number, dto: UpdateSectorRequest) => Promise<void>;
  deleteSector: (id: number) => Promise<void>;
  filterByName: (name: string) => Sector[];
} {
  const [allSectors, setAllSectors] = useState<Sector[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSectors = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await sectorService.getAll();
      setAllSectors(data);
      setSectors(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar sectores');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterByName = useCallback(
    (name: string): Sector[] => {
      if (!name) return allSectors;
      const lower = name.toLowerCase();
      return allSectors.filter((s) => s.name.toLowerCase().includes(lower));
    },
    [allSectors],
  );

  const createSector = useCallback(async (dto: CreateSectorRequest): Promise<void> => {
    await sectorService.create(dto);
  }, []);

  const updateSector = useCallback(async (id: number, dto: UpdateSectorRequest): Promise<void> => {
    await sectorService.update(id, dto);
  }, []);

  const deleteSector = useCallback(async (id: number): Promise<void> => {
    await sectorService.delete(id);
  }, []);

  return { sectors, loading, error, loadSectors, createSector, updateSector, deleteSector, filterByName };
}
