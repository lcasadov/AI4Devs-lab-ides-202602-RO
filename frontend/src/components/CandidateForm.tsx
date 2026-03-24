import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sectorService } from '../services/sector.service';
import { jobtypeService } from '../services/jobtype.service';
import { candidateService } from '../services/candidate.service';
import {
  Candidate,
  CreateCandidateFormData,
  EducationEntry,
  UpdateCandidateData,
  WorkExperienceEntry,
} from '../types/candidate';
import { Sector } from '../types/sector.types';
import { JobType } from '../types/jobtype.types';

interface CandidateFormProps {
  candidate?: Candidate;
  onSuccess: () => void;
  onCancel: () => void;
}

interface BasicFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  province: string;
  municipality: string;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  postalCode?: string;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string): boolean {
  return /^\+34[0-9]{9}$/.test(value);
}

function isValidPostalCode(value: string): boolean {
  return /^\d{5}$/.test(value);
}

const ff = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const inputBase: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  border: '1.5px solid #e2e8f0', borderRadius: '10px',
  padding: '11px 14px', fontSize: '14px', color: '#1e293b',
  background: '#fff', outline: 'none',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const inputErrorBase: React.CSSProperties = {
  ...inputBase,
  borderColor: '#fca5a5',
};

const inputSmall: React.CSSProperties = {
  ...inputBase,
  padding: '8px 12px',
  fontSize: '13px',
  borderRadius: '8px',
};

function focusIn(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>): void {
  e.target.style.borderColor = '#3b82f6';
  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
}
function focusOut(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>): void {
  e.target.style.borderColor = '#e2e8f0';
  e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
}
function focusOutError(e: React.FocusEvent<HTMLInputElement>): void {
  e.target.style.borderColor = '#fca5a5';
  e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
}

function SectionTitle({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '2px' }}>
      {children}
    </p>
  );
}

export function CandidateForm({ candidate, onSuccess, onCancel }: CandidateFormProps): JSX.Element {
  const { token } = useAuth();
  const isEditMode = candidate !== undefined;

  const [fields, setFields] = useState<BasicFields>({
    firstName: candidate?.firstName ?? '',
    lastName: candidate?.lastName ?? '',
    email: candidate?.email ?? '',
    phone: candidate?.phone ?? '',
    address: candidate?.address ?? '',
    postalCode: candidate?.postalCode ?? '',
    province: candidate?.province ?? '',
    municipality: candidate?.municipality ?? '',
  });

  const [sectorId, setSectorId] = useState<number | ''>(candidate?.sectorId ?? '');
  const [jobTypeId, setJobTypeId] = useState<number | ''>(candidate?.jobTypeId ?? '');
  const [education, setEducation] = useState<EducationEntry[]>(candidate?.education ?? []);
  const [workExperience, setWorkExperience] = useState<WorkExperienceEntry[]>(candidate?.workExperience ?? []);

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cvFile, setCvFile] = useState<File | undefined>(undefined);
  const [cvError, setCvError] = useState<string | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvSuccess, setCvSuccess] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        onCancel();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  useEffect(() => {
    sectorService.getAll().then(setSectors).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sectorId === '') {
      setJobTypes([]);
      return;
    }
    jobtypeService.getAll({ sectorId: sectorId as number }).then(setJobTypes).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectorId]);

  function handleFieldChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleSectorChange(e: ChangeEvent<HTMLSelectElement>): void {
    const value = e.target.value;
    setSectorId(value === '' ? '' : parseInt(value, 10));
    setJobTypeId('');
  }

  function handleJobTypeChange(e: ChangeEvent<HTMLSelectElement>): void {
    const value = e.target.value;
    if (value === '') {
      setJobTypeId('');
      return;
    }
    const selectedId = parseInt(value, 10);
    setJobTypeId(selectedId);
    if (sectorId === '') {
      const selectedJobType = jobTypes.find((jt) => jt.id === selectedId);
      if (selectedJobType) {
        setSectorId(selectedJobType.sector.id);
      }
    }
  }

  function addEducation(): void {
    setEducation((prev) => [...prev, { institution: '', degree: '', startYear: '', endYear: '' }]);
  }

  function removeEducation(index: number): void {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  }

  function updateEducation(index: number, field: keyof EducationEntry, value: string): void {
    setEducation((prev) => prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)));
  }

  function addWorkExperience(): void {
    setWorkExperience((prev) => [...prev, { company: '', position: '', startYear: '', endYear: '', description: '' }]);
  }

  function removeWorkExperience(index: number): void {
    setWorkExperience((prev) => prev.filter((_, i) => i !== index));
  }

  function updateWorkExperience(index: number, field: keyof WorkExperienceEntry, value: string): void {
    setWorkExperience((prev) => prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)));
  }

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!fields.firstName.trim()) errors.firstName = 'El nombre es requerido';
    if (!fields.lastName.trim()) errors.lastName = 'El apellido es requerido';
    if (!fields.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!isValidEmail(fields.email)) {
      errors.email = 'El formato del email no es válido';
    }
    if (fields.phone.trim() && !isValidPhone(fields.phone.trim())) {
      errors.phone = 'El teléfono debe tener el formato +34XXXXXXXXX';
    }
    if (fields.postalCode.trim() && !isValidPostalCode(fields.postalCode.trim())) {
      errors.postalCode = 'El código postal debe tener exactamente 5 dígitos';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setError(null);
    try {
      if (isEditMode && candidate !== undefined) {
        const updateData: UpdateCandidateData = {
          firstName: fields.firstName.trim(),
          lastName: fields.lastName.trim(),
          email: fields.email.trim(),
          phone: fields.phone.trim() || undefined,
          address: fields.address.trim() || undefined,
          postalCode: fields.postalCode.trim() || undefined,
          province: fields.province.trim() || undefined,
          municipality: fields.municipality.trim() || undefined,
          sectorId: sectorId !== '' ? sectorId : null,
          jobTypeId: jobTypeId !== '' ? jobTypeId : null,
          education: education.length > 0 ? education : undefined,
          workExperience: workExperience.length > 0 ? workExperience : undefined,
        };
        await candidateService.update(candidate.id, updateData, token ?? undefined);
      } else {
        const createData: CreateCandidateFormData = {
          firstName: fields.firstName.trim(),
          lastName: fields.lastName.trim(),
          email: fields.email.trim(),
          phone: fields.phone.trim() || undefined,
          address: fields.address.trim() || undefined,
          postalCode: fields.postalCode.trim() || undefined,
          province: fields.province.trim() || undefined,
          municipality: fields.municipality.trim() || undefined,
          sectorId: sectorId !== '' ? sectorId : undefined,
          jobTypeId: jobTypeId !== '' ? jobTypeId : undefined,
          education: education.length > 0 ? education : undefined,
          workExperience: workExperience.length > 0 ? workExperience : undefined,
        };
        await candidateService.create(createData, token ?? undefined);
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el candidato');
    } finally {
      setIsLoading(false);
    }
  }

  function handleCvFileChange(e: ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    setCvError(null);
    setCvSuccess(false);
    if (!file) { setCvFile(undefined); return; }
    if (file.size > 5 * 1024 * 1024) {
      setCvError('El archivo no puede superar 5 MB');
      setCvFile(undefined);
      return;
    }
    setCvFile(file);
  }

  async function handleCvUpload(): Promise<void> {
    if (!cvFile || !candidate) return;
    setCvUploading(true);
    setCvError(null);
    setCvSuccess(false);
    try {
      await candidateService.uploadCv(candidate.id, cvFile, token ?? undefined);
      setCvSuccess(true);
      setCvFile(undefined);
    } catch (err: unknown) {
      setCvError(err instanceof Error ? err.message : 'Error al subir el CV');
    } finally {
      setCvUploading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => { void handleSubmit(e); }}
      noValidate
      style={{ fontFamily: ff, display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '680px' }}
    >
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '4px', letterSpacing: '-0.3px' }}>
          {isEditMode ? 'Editar candidato' : 'Nuevo candidato'}
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Los campos marcados con <span style={{ color: '#ef4444' }}>*</span> son obligatorios.
        </p>
      </div>

      {/* — Datos personales — */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <SectionTitle>Datos personales</SectionTitle>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="firstName" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              Nombre <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="firstName" name="firstName" type="text"
              value={fields.firstName} onChange={handleFieldChange} disabled={isLoading}
              style={fieldErrors.firstName ? inputErrorBase : inputBase}
              onFocus={focusIn}
              onBlur={fieldErrors.firstName ? focusOutError : focusOut}
            />
            {fieldErrors.firstName && (
              <span style={{ fontSize: '12px', color: '#dc2626' }}>{fieldErrors.firstName}</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="lastName" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              Apellido <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="lastName" name="lastName" type="text"
              value={fields.lastName} onChange={handleFieldChange} disabled={isLoading}
              style={fieldErrors.lastName ? inputErrorBase : inputBase}
              onFocus={focusIn}
              onBlur={fieldErrors.lastName ? focusOutError : focusOut}
            />
            {fieldErrors.lastName && (
              <span style={{ fontSize: '12px', color: '#dc2626' }}>{fieldErrors.lastName}</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="email" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
            Email <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="email" name="email" type="email"
            value={fields.email} onChange={handleFieldChange} disabled={isLoading}
            style={fieldErrors.email ? inputErrorBase : inputBase}
            onFocus={focusIn}
            onBlur={fieldErrors.email ? focusOutError : focusOut}
          />
          {fieldErrors.email && (
            <span style={{ fontSize: '12px', color: '#dc2626' }}>{fieldErrors.email}</span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="phone" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
            Teléfono
          </label>
          <input
            id="phone" name="phone" type="text"
            value={fields.phone} onChange={handleFieldChange} disabled={isLoading}
            placeholder="+34XXXXXXXXX"
            style={fieldErrors.phone ? inputErrorBase : inputBase}
            onFocus={focusIn}
            onBlur={fieldErrors.phone ? focusOutError : focusOut}
          />
          {fieldErrors.phone && (
            <span style={{ fontSize: '12px', color: '#dc2626' }}>{fieldErrors.phone}</span>
          )}
        </div>
      </div>

      {/* — Ubicación — */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <SectionTitle>Ubicación</SectionTitle>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="address" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
            Dirección
          </label>
          <input
            id="address" name="address" type="text"
            value={fields.address} onChange={handleFieldChange} disabled={isLoading}
            style={inputBase}
            onFocus={focusIn} onBlur={focusOut}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="postalCode" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              C.P.
            </label>
            <input
              id="postalCode" name="postalCode" type="text"
              value={fields.postalCode} onChange={handleFieldChange} disabled={isLoading}
              style={fieldErrors.postalCode ? inputErrorBase : inputBase}
              onFocus={focusIn}
              onBlur={fieldErrors.postalCode ? focusOutError : focusOut}
            />
            {fieldErrors.postalCode && (
              <span style={{ fontSize: '12px', color: '#dc2626' }}>{fieldErrors.postalCode}</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="province" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              Provincia
            </label>
            <input
              id="province" name="province" type="text"
              value={fields.province} onChange={handleFieldChange} disabled={isLoading}
              style={inputBase}
              onFocus={focusIn} onBlur={focusOut}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="municipality" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              Municipio
            </label>
            <input
              id="municipality" name="municipality" type="text"
              value={fields.municipality} onChange={handleFieldChange} disabled={isLoading}
              style={inputBase}
              onFocus={focusIn} onBlur={focusOut}
            />
          </div>
        </div>
      </div>

      {/* — Puesto — */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <SectionTitle>Puesto</SectionTitle>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="sectorId" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              Sector
            </label>
            <select
              id="sectorId"
              value={sectorId} onChange={handleSectorChange} disabled={isLoading}
              style={{ ...inputBase, cursor: 'pointer' }}
              onFocus={focusIn} onBlur={focusOut}
            >
              <option value="">— Sin sector —</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="jobTypeId" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
              Tipo de puesto
            </label>
            <select
              id="jobTypeId"
              value={jobTypeId} onChange={handleJobTypeChange}
              disabled={isLoading || sectorId === ''}
              style={{ ...inputBase, cursor: (isLoading || sectorId === '') ? 'not-allowed' : 'pointer', background: (isLoading || sectorId === '') ? '#f8fafc' : '#fff' }}
              onFocus={focusIn} onBlur={focusOut}
            >
              <option value="">— Sin tipo —</option>
              {jobTypes.map((jt) => (
                <option key={jt.id} value={jt.id}>{jt.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* — Educación — */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SectionTitle>Educación</SectionTitle>
          <button
            type="button" onClick={addEducation} disabled={isLoading}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#2563eb', fontWeight: 600, padding: 0 }}
          >
            + Añadir
          </button>
        </div>
        {education.map((entry, index) => (
          <div key={index} style={{
            border: '1px solid #e2e8f0', borderRadius: '10px',
            padding: '14px', background: '#f8fafc',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="text" placeholder="Institución"
                value={entry.institution}
                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                disabled={isLoading}
                style={inputSmall}
                onFocus={focusIn} onBlur={focusOut}
              />
              <input
                type="text" placeholder="Titulación"
                value={entry.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                disabled={isLoading}
                style={inputSmall}
                onFocus={focusIn} onBlur={focusOut}
              />
              <input
                type="text" placeholder="Año inicio"
                value={entry.startYear}
                onChange={(e) => updateEducation(index, 'startYear', e.target.value)}
                disabled={isLoading}
                style={inputSmall}
                onFocus={focusIn} onBlur={focusOut}
              />
              <input
                type="text" placeholder="Año fin"
                value={entry.endYear}
                onChange={(e) => updateEducation(index, 'endYear', e.target.value)}
                disabled={isLoading}
                style={inputSmall}
                onFocus={focusIn} onBlur={focusOut}
              />
            </div>
            <button
              type="button" onClick={() => removeEducation(index)} disabled={isLoading}
              style={{ alignSelf: 'flex-end', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#ef4444', fontWeight: 600, padding: 0 }}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {/* — Experiencia laboral — */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SectionTitle>Experiencia laboral</SectionTitle>
          <button
            type="button" onClick={addWorkExperience} disabled={isLoading}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#2563eb', fontWeight: 600, padding: 0 }}
          >
            + Añadir
          </button>
        </div>
        {workExperience.map((entry, index) => (
          <div key={index} style={{
            border: '1px solid #e2e8f0', borderRadius: '10px',
            padding: '14px', background: '#f8fafc',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="text" placeholder="Empresa"
                value={entry.company}
                onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                disabled={isLoading}
                style={inputSmall}
                onFocus={focusIn} onBlur={focusOut}
              />
              <input
                type="text" placeholder="Puesto"
                value={entry.position}
                onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                disabled={isLoading}
                style={inputSmall}
                onFocus={focusIn} onBlur={focusOut}
              />
              <input
                type="text" placeholder="Año inicio"
                value={entry.startYear}
                onChange={(e) => updateWorkExperience(index, 'startYear', e.target.value)}
                disabled={isLoading}
                style={inputSmall}
                onFocus={focusIn} onBlur={focusOut}
              />
              <input
                type="text" placeholder="Año fin"
                value={entry.endYear}
                onChange={(e) => updateWorkExperience(index, 'endYear', e.target.value)}
                disabled={isLoading}
                style={inputSmall}
                onFocus={focusIn} onBlur={focusOut}
              />
            </div>
            <input
              type="text" placeholder="Descripción"
              value={entry.description}
              onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
              disabled={isLoading}
              style={inputSmall}
              onFocus={focusIn} onBlur={focusOut}
            />
            <button
              type="button" onClick={() => removeWorkExperience(index)} disabled={isLoading}
              style={{ alignSelf: 'flex-end', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#ef4444', fontWeight: 600, padding: 0 }}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {/* — CV — */}
      {isEditMode && candidate !== undefined && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <SectionTitle>Curriculum Vitae</SectionTitle>
          <div style={{
            border: '1px solid #e2e8f0', borderRadius: '10px',
            padding: '16px', background: '#f8fafc',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            {candidate.cvFileName && (
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                Archivo actual: <span style={{ fontWeight: 600, color: '#1e293b' }}>{candidate.cvFileName}</span>
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <input
                type="file" accept=".pdf,.docx"
                onChange={handleCvFileChange} disabled={cvUploading}
                style={{ fontSize: '13px', color: '#374151', flex: 1, minWidth: '200px' }}
              />
              <button
                type="button"
                onClick={() => { void handleCvUpload(); }}
                disabled={!cvFile || cvUploading}
                style={{
                  background: (!cvFile || cvUploading) ? '#93c5fd' : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                  color: '#fff', fontWeight: 700, fontSize: '13px',
                  border: 'none', borderRadius: '8px', padding: '9px 16px',
                  cursor: (!cvFile || cvUploading) ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cvUploading ? 'Subiendo...' : 'Subir CV'}
              </button>
            </div>
            {cvError && (
              <p style={{ fontSize: '12px', color: '#dc2626' }}>{cvError}</p>
            )}
            {cvSuccess && (
              <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>✓ CV subido correctamente</p>
            )}
          </div>
        </div>
      )}

      {/* Error general */}
      {error && (
        <div role="alert" style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
          padding: '12px 14px', fontSize: '13px', color: '#dc2626',
          display: 'flex', gap: '8px', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '15px', lineHeight: 1.2 }}>⚠️</span>
          {error}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
        <button
          type="submit" disabled={isLoading}
          style={{
            flex: 1,
            background: isLoading ? '#93c5fd' : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
            color: '#fff', fontWeight: 700, fontSize: '15px',
            border: 'none', borderRadius: '10px', padding: '13px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: isLoading ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
          }}
        >
          {isLoading ? 'Guardando...' : 'Guardar candidato'}
        </button>
        <button
          type="button" onClick={onCancel} disabled={isLoading}
          style={{
            flex: 1, background: '#fff', color: '#374151',
            fontWeight: 600, fontSize: '15px',
            border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '13px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
