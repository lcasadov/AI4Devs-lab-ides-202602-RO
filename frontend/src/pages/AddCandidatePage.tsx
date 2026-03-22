import React, { useState } from 'react';
import { CandidateForm } from '../components/CandidateForm';

interface AddCandidatePageProps {
  onBack: () => void;
}

export function AddCandidatePage({ onBack }: AddCandidatePageProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);

  function handleSuccess() {
    setIsSuccess(true);
  }

  function handleAddAnother() {
    setIsSuccess(false);
    setFormKey((prev) => prev + 1);
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          ← Volver
        </button>
        <h1 style={styles.title}>Añadir candidato</h1>
      </div>

      <div style={styles.content}>
        {isSuccess ? (
          <div style={styles.successContainer}>
            <div style={styles.successBanner} role="status">
              ✓ Candidato añadido correctamente
            </div>
            <button onClick={handleAddAnother} style={styles.addAnotherButton}>
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

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#374151',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 700,
    color: '#111827',
  },
  content: {
    maxWidth: '600px',
  },
  successContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'flex-start',
  },
  successBanner: {
    padding: '16px 20px',
    backgroundColor: '#d1fae5',
    border: '1px solid #6ee7b7',
    borderRadius: '8px',
    color: '#065f46',
    fontSize: '16px',
    fontWeight: 600,
  },
  addAnotherButton: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
