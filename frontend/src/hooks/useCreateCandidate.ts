import { useState } from 'react';
import { candidateService } from '../services/candidate.service';
import { CreateCandidateFormData } from '../types/candidate';

interface UseCreateCandidateResult {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  createCandidate: (dto: CreateCandidateFormData) => Promise<void>;
}

export function useCreateCandidate(): UseCreateCandidateResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function createCandidate(dto: CreateCandidateFormData): Promise<void> {
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      await candidateService.create(dto);
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error inesperado al crear el candidato');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return { isLoading, error, success, createCandidate };
}
