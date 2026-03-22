import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useCreateCandidate } from '../hooks/useCreateCandidate';
import { CreateCandidateDto } from '../types/candidate';

interface CandidateFormProps {
  onSuccess: () => void;
}

interface FormFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  education: string;
  workExperience: string;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function CandidateForm({ onSuccess }: CandidateFormProps) {
  const { isLoading, error, success, createCandidate } = useCreateCandidate();

  const [fields, setFields] = useState<FormFields>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    education: '',
    workExperience: '',
  });

  const [cvFile, setCvFile] = useState<File | undefined>(undefined);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  React.useEffect(() => {
    if (success) {
      onSuccess();
    }
  }, [success, onSuccess]);

  function handleFieldChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setCvFile(file ?? undefined);
  }

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!fields.firstName.trim()) {
      errors.firstName = 'El nombre es requerido';
    }
    if (!fields.lastName.trim()) {
      errors.lastName = 'El apellido es requerido';
    }
    if (!fields.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!isValidEmail(fields.email)) {
      errors.email = 'El formato del email no es válido';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    const dto: CreateCandidateDto = {
      firstName: fields.firstName.trim(),
      lastName: fields.lastName.trim(),
      email: fields.email.trim(),
      phone: fields.phone.trim() || undefined,
      address: fields.address.trim() || undefined,
      education: fields.education.trim() || undefined,
      workExperience: fields.workExperience.trim() || undefined,
      cv: cvFile,
    };

    await createCandidate(dto);
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={styles.form}>
      <div style={styles.fieldGroup}>
        <label htmlFor="firstName" style={styles.label}>
          Nombre <span style={styles.required}>*</span>
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          value={fields.firstName}
          onChange={handleFieldChange}
          style={fieldErrors.firstName ? styles.inputError : styles.input}
          disabled={isLoading}
        />
        {fieldErrors.firstName && (
          <span style={styles.errorText}>{fieldErrors.firstName}</span>
        )}
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="lastName" style={styles.label}>
          Apellido <span style={styles.required}>*</span>
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          value={fields.lastName}
          onChange={handleFieldChange}
          style={fieldErrors.lastName ? styles.inputError : styles.input}
          disabled={isLoading}
        />
        {fieldErrors.lastName && (
          <span style={styles.errorText}>{fieldErrors.lastName}</span>
        )}
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="email" style={styles.label}>
          Email <span style={styles.required}>*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={fields.email}
          onChange={handleFieldChange}
          style={fieldErrors.email ? styles.inputError : styles.input}
          disabled={isLoading}
        />
        {fieldErrors.email && (
          <span style={styles.errorText}>{fieldErrors.email}</span>
        )}
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="phone" style={styles.label}>
          Teléfono
        </label>
        <input
          id="phone"
          name="phone"
          type="text"
          value={fields.phone}
          onChange={handleFieldChange}
          style={styles.input}
          disabled={isLoading}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="address" style={styles.label}>
          Dirección
        </label>
        <input
          id="address"
          name="address"
          type="text"
          value={fields.address}
          onChange={handleFieldChange}
          style={styles.input}
          disabled={isLoading}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="education" style={styles.label}>
          Educación
        </label>
        <textarea
          id="education"
          name="education"
          value={fields.education}
          onChange={handleFieldChange}
          rows={4}
          style={styles.textarea}
          disabled={isLoading}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="workExperience" style={styles.label}>
          Experiencia laboral
        </label>
        <textarea
          id="workExperience"
          name="workExperience"
          value={fields.workExperience}
          onChange={handleFieldChange}
          rows={4}
          style={styles.textarea}
          disabled={isLoading}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="cv" style={styles.label}>
          CV (PDF o DOCX)
        </label>
        <input
          id="cv"
          name="cv"
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          style={styles.fileInput}
          disabled={isLoading}
        />
      </div>

      {error && (
        <div style={styles.generalError} role="alert">
          {error}
        </div>
      )}

      <button type="submit" disabled={isLoading} style={styles.submitButton}>
        {isLoading ? 'Guardando...' : 'Añadir candidato'}
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '600px',
    width: '100%',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontWeight: 600,
    fontSize: '14px',
    color: '#374151',
  },
  required: {
    color: '#ef4444',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  },
  inputError: {
    padding: '8px 12px',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  },
  textarea: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    resize: 'vertical',
    outline: 'none',
  },
  fileInput: {
    fontSize: '14px',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '12px',
  },
  generalError: {
    padding: '10px 14px',
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    color: '#b91c1c',
    fontSize: '14px',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
};
