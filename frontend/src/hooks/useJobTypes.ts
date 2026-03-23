import { useState, useCallback } from 'react';
import { JobType, CreateJobTypeRequest, UpdateJobTypeRequest, JobTypeFilters } from '../types/jobtype.types';
import { jobtypeService } from '../services/jobtype.service';

interface UseJobTypesState {
  jobTypes: JobType[];
  loading: boolean;
  error: string | null;
}

export function useJobTypes(): UseJobTypesState & {
  loadJobTypes: (filters?: JobTypeFilters) => Promise<void>;
  createJobType: (dto: CreateJobTypeRequest) => Promise<void>;
  updateJobType: (id: number, dto: UpdateJobTypeRequest) => Promise<void>;
  deleteJobType: (id: number) => Promise<void>;
} {
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadJobTypes = useCallback(async (filters?: JobTypeFilters): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobtypeService.getAll(
        filters?.sectorId !== undefined ? { sectorId: filters.sectorId } : undefined,
      );
      const filtered =
        filters?.name
          ? data.filter((jt) => jt.name.toLowerCase().includes((filters.name ?? '').toLowerCase()))
          : data;
      setJobTypes(filtered);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar tipos de puesto');
    } finally {
      setLoading(false);
    }
  }, []);

  const createJobType = useCallback(async (dto: CreateJobTypeRequest): Promise<void> => {
    await jobtypeService.create(dto);
  }, []);

  const updateJobType = useCallback(async (id: number, dto: UpdateJobTypeRequest): Promise<void> => {
    await jobtypeService.update(id, dto);
  }, []);

  const deleteJobType = useCallback(async (id: number): Promise<void> => {
    await jobtypeService.delete(id);
  }, []);

  return { jobTypes, loading, error, loadJobTypes, createJobType, updateJobType, deleteJobType };
}
