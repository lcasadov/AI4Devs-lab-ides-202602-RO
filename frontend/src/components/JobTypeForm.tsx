import React, { useState, useEffect } from 'react';
import { JobType, CreateJobTypeRequest, UpdateJobTypeRequest } from '../types/jobtype.types';
import { Sector } from '../types/sector.types';
import { sectorService } from '../services/sector.service';

interface JobTypeFormProps {
  jobType?: JobType;
  onSave: () => void;
  onCancel: () => void;
  onCreate: (dto: CreateJobTypeRequest) => Promise<void>;
  onUpdate: (id: number, dto: UpdateJobTypeRequest) => Promise<void>;
}

export function JobTypeForm({ jobType, onSave, onCancel, onCreate, onUpdate }: JobTypeFormProps): JSX.Element {
  const [name, setName] = useState(jobType?.name ?? '');
  const [sectorId, setSectorId] = useState<number | ''>(jobType?.sectorId ?? '');
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isEditing = jobType !== undefined;

  useEffect(() => {
    sectorService.getAll().then(setSectors).catch(() => {
      setError('Error al cargar los sectores');
    });
  }, []);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (name.trim().length > 100) {
      setError('El nombre no puede superar los 100 caracteres');
      return;
    }
    if (sectorId === '') {
      setError('El sector es obligatorio');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const dto = { name: name.trim(), sectorId: sectorId as number };
      if (isEditing && jobType) {
        await onUpdate(jobType.id, dto);
      } else {
        await onCreate(dto);
      }
      onSave();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el tipo de puesto');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full max-w-md">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {isEditing ? 'Editar tipo de puesto' : 'Nuevo tipo de puesto'}
      </h2>
      <form onSubmit={(e) => { void handleSubmit(e); }}>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4" role="alert">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="jobtype-name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="jobtype-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre del tipo de puesto"
            autoFocus
          />
        </div>
        <div className="mb-6">
          <label htmlFor="jobtype-sector" className="block text-sm font-medium text-gray-700 mb-1">
            Sector <span className="text-red-500">*</span>
          </label>
          <select
            id="jobtype-sector"
            value={sectorId}
            onChange={(e) => setSectorId(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona un sector...</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
