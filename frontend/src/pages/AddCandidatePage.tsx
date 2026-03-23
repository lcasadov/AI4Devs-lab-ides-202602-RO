import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CandidateForm } from '../components/CandidateForm';

export function AddCandidatePage(): JSX.Element {
  const [isSuccess, setIsSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const navigate = useNavigate();

  function handleSuccess(): void {
    setIsSuccess(true);
  }

  function handleAddAnother(): void {
    setIsSuccess(false);
    setFormKey((prev) => prev + 1);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-900 m-0">Añadir candidato</h1>
      </div>

      <div className="max-w-2xl">
        {isSuccess ? (
          <div className="flex flex-col gap-5 items-start">
            <div
              className="px-5 py-4 bg-green-100 border border-green-300 rounded-lg text-green-800 text-base font-semibold"
              role="status"
            >
              Candidato añadido correctamente
            </div>
            <button
              onClick={handleAddAnother}
              className="px-5 py-2.5 bg-blue-600 text-white border-none rounded-md text-base font-semibold cursor-pointer hover:bg-blue-700"
            >
              Añadir otro candidato
            </button>
          </div>
        ) : (
          <CandidateForm key={formKey} onSuccess={handleSuccess} />
        )}
      </div>
    </div>
  );
}
