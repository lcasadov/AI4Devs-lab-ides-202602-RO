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
  const [education, setEducation] = useState<EducationEntry[]>(
    candidate?.education ?? []
  );
  const [workExperience, setWorkExperience] = useState<WorkExperienceEntry[]>(
    candidate?.workExperience ?? []
  );

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CV upload state (edit mode only)
  const [cvFile, setCvFile] = useState<File | undefined>(undefined);
  const [cvError, setCvError] = useState<string | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvSuccess, setCvSuccess] = useState(false);

  // Escape key to close form
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        onCancel();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // Load sectors on mount
  useEffect(() => {
    sectorService.getAll().then(setSectors).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load job types when sectorId changes
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
    // Auto-select sector if not already selected
    if (sectorId === '') {
      const selectedJobType = jobTypes.find((jt) => jt.id === selectedId);
      if (selectedJobType) {
        setSectorId(selectedJobType.sector.id);
      }
    }
  }

  // Education handlers
  function addEducation(): void {
    setEducation((prev) => [
      ...prev,
      { institution: '', degree: '', startYear: '', endYear: '' },
    ]);
  }

  function removeEducation(index: number): void {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  }

  function updateEducation(index: number, field: keyof EducationEntry, value: string): void {
    setEducation((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    );
  }

  // Work experience handlers
  function addWorkExperience(): void {
    setWorkExperience((prev) => [
      ...prev,
      { company: '', position: '', startYear: '', endYear: '', description: '' },
    ]);
  }

  function removeWorkExperience(index: number): void {
    setWorkExperience((prev) => prev.filter((_, i) => i !== index));
  }

  function updateWorkExperience(
    index: number,
    field: keyof WorkExperienceEntry,
    value: string
  ): void {
    setWorkExperience((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    );
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
    if (!file) {
      setCvFile(undefined);
      return;
    }
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
    <form onSubmit={(e) => { void handleSubmit(e); }} noValidate className="flex flex-col gap-4 max-w-2xl w-full">
      <h2 className="text-xl font-bold text-gray-900">
        {isEditMode ? 'Editar candidato' : 'Nuevo candidato'}
      </h2>

      {/* Basic fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={fields.firstName}
            onChange={handleFieldChange}
            disabled={isLoading}
            className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              fieldErrors.firstName ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {fieldErrors.firstName && (
            <span className="text-xs text-red-600">{fieldErrors.firstName}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
            Apellido <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={fields.lastName}
            onChange={handleFieldChange}
            disabled={isLoading}
            className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              fieldErrors.lastName ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {fieldErrors.lastName && (
            <span className="text-xs text-red-600">{fieldErrors.lastName}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-semibold text-gray-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={fields.email}
          onChange={handleFieldChange}
          disabled={isLoading}
          className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            fieldErrors.email ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {fieldErrors.email && (
          <span className="text-xs text-red-600">{fieldErrors.email}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-sm font-semibold text-gray-700">
          Teléfono
        </label>
        <input
          id="phone"
          name="phone"
          type="text"
          value={fields.phone}
          onChange={handleFieldChange}
          placeholder="+34XXXXXXXXX"
          disabled={isLoading}
          className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            fieldErrors.phone ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {fieldErrors.phone && (
          <span className="text-xs text-red-600">{fieldErrors.phone}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="address" className="text-sm font-semibold text-gray-700">
          Dirección
        </label>
        <input
          id="address"
          name="address"
          type="text"
          value={fields.address}
          onChange={handleFieldChange}
          disabled={isLoading}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Location fields */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="postalCode" className="text-sm font-semibold text-gray-700">
            Código postal
          </label>
          <input
            id="postalCode"
            name="postalCode"
            type="text"
            value={fields.postalCode}
            onChange={handleFieldChange}
            disabled={isLoading}
            className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              fieldErrors.postalCode ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          {fieldErrors.postalCode && (
            <span className="text-xs text-red-600">{fieldErrors.postalCode}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="province" className="text-sm font-semibold text-gray-700">
            Provincia
          </label>
          <input
            id="province"
            name="province"
            type="text"
            value={fields.province}
            onChange={handleFieldChange}
            disabled={isLoading}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="municipality" className="text-sm font-semibold text-gray-700">
            Municipio
          </label>
          <input
            id="municipality"
            name="municipality"
            type="text"
            value={fields.municipality}
            onChange={handleFieldChange}
            disabled={isLoading}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Chained combos: Sector + Job Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="sectorId" className="text-sm font-semibold text-gray-700">
            Sector
          </label>
          <select
            id="sectorId"
            value={sectorId}
            onChange={handleSectorChange}
            disabled={isLoading}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">— Sin sector —</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="jobTypeId" className="text-sm font-semibold text-gray-700">
            Tipo de puesto
          </label>
          <select
            id="jobTypeId"
            value={jobTypeId}
            onChange={handleJobTypeChange}
            disabled={isLoading || sectorId === ''}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">— Sin tipo —</option>
            {jobTypes.map((jt) => (
              <option key={jt.id} value={jt.id}>
                {jt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Education */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Educación</span>
          <button
            type="button"
            onClick={addEducation}
            disabled={isLoading}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            + Añadir educación
          </button>
        </div>
        {education.map((entry, index) => (
          <div key={index} className="border border-gray-200 rounded-md p-3 flex flex-col gap-2 bg-gray-50">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Institución"
                value={entry.institution}
                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                disabled={isLoading}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Titulación"
                value={entry.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                disabled={isLoading}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Año inicio"
                value={entry.startYear}
                onChange={(e) => updateEducation(index, 'startYear', e.target.value)}
                disabled={isLoading}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Año fin"
                value={entry.endYear}
                onChange={(e) => updateEducation(index, 'endYear', e.target.value)}
                disabled={isLoading}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={() => removeEducation(index)}
              disabled={isLoading}
              className="text-xs text-red-600 hover:text-red-800 underline self-end"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {/* Work Experience */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Experiencia laboral</span>
          <button
            type="button"
            onClick={addWorkExperience}
            disabled={isLoading}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            + Añadir experiencia
          </button>
        </div>
        {workExperience.map((entry, index) => (
          <div key={index} className="border border-gray-200 rounded-md p-3 flex flex-col gap-2 bg-gray-50">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Empresa"
                value={entry.company}
                onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                disabled={isLoading}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Puesto"
                value={entry.position}
                onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                disabled={isLoading}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Año inicio"
                value={entry.startYear}
                onChange={(e) => updateWorkExperience(index, 'startYear', e.target.value)}
                disabled={isLoading}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Año fin"
                value={entry.endYear}
                onChange={(e) => updateWorkExperience(index, 'endYear', e.target.value)}
                disabled={isLoading}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <input
              type="text"
              placeholder="Descripción"
              value={entry.description}
              onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
              disabled={isLoading}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => removeWorkExperience(index)}
              disabled={isLoading}
              className="text-xs text-red-600 hover:text-red-800 underline self-end"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {/* CV Upload (edit mode only) */}
      {isEditMode && candidate !== undefined && (
        <div className="flex flex-col gap-2 border border-gray-200 rounded-md p-3 bg-gray-50">
          <span className="text-sm font-semibold text-gray-700">CV</span>
          {candidate.cvFileName && (
            <p className="text-xs text-gray-500">Actual: {candidate.cvFileName}</p>
          )}
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleCvFileChange}
              disabled={cvUploading}
              className="text-sm"
            />
            <button
              type="button"
              onClick={() => { void handleCvUpload(); }}
              disabled={!cvFile || cvUploading}
              className="bg-blue-600 text-white text-xs font-semibold rounded px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50"
            >
              {cvUploading ? 'Subiendo...' : 'Subir CV'}
            </button>
          </div>
          {cvError && <span className="text-xs text-red-600">{cvError}</span>}
          {cvSuccess && <span className="text-xs text-green-600">CV subido correctamente</span>}
        </div>
      )}

      {/* General error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white font-semibold rounded-lg py-2 px-5 hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="border border-gray-300 text-gray-700 font-semibold rounded-lg py-2 px-5 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
