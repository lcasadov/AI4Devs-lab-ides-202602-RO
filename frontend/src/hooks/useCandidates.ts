import { useState, useCallback } from 'react';
import { Candidate, CreateCandidateFormData, UpdateCandidateData } from '../types/candidate';
import { candidateService } from '../services/candidate.service';
import { useAuth } from '../context/AuthContext';

interface UseCandidatesState {
  candidates: Candidate[];
  isLoading: boolean;
  error: string | null;
}

export function useCandidates(): UseCandidatesState & {
  loadCandidates: () => Promise<void>;
  createCandidate: (data: CreateCandidateFormData) => Promise<void>;
  updateCandidate: (id: number, data: UpdateCandidateData) => Promise<void>;
  deleteCandidate: (id: number) => Promise<void>;
  uploadCv: (id: number, file: File) => Promise<void>;
} {
  const { token } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCandidates = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await candidateService.getAll(token ?? undefined);
      setCandidates(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar candidatos');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const createCandidate = useCallback(async (data: CreateCandidateFormData): Promise<void> => {
    await candidateService.create(data, token ?? undefined);
    await loadCandidates();
  }, [token, loadCandidates]);

  const updateCandidate = useCallback(async (id: number, data: UpdateCandidateData): Promise<void> => {
    await candidateService.update(id, data, token ?? undefined);
    await loadCandidates();
  }, [token, loadCandidates]);

  const deleteCandidate = useCallback(async (id: number): Promise<void> => {
    await candidateService.delete(id, token ?? undefined);
    await loadCandidates();
  }, [token, loadCandidates]);

  const uploadCv = useCallback(async (id: number, file: File): Promise<void> => {
    await candidateService.uploadCv(id, file, token ?? undefined);
    await loadCandidates();
  }, [token, loadCandidates]);

  return {
    candidates,
    isLoading,
    error,
    loadCandidates,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    uploadCv,
  };
}
