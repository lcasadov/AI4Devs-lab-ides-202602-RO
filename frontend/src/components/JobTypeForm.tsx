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

const ff = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const inputBase: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  border: '1.5px solid #e2e8f0', borderRadius: '10px',
  padding: '11px 14px', fontSize: '14px', color: '#1e293b',
  background: '#fff', outline: 'none',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

function focusIn(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>): void {
  e.target.style.borderColor = '#3b82f6';
  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
}
function focusOut(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>): void {
  e.target.style.borderColor = '#e2e8f0';
  e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
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

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        onCancel();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

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
    <div style={{ fontFamily: ff }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '4px', letterSpacing: '-0.3px' }}>
          {isEditing ? 'Editar tipo de puesto' : 'Nuevo tipo de puesto'}
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          {isEditing ? 'Modifica los datos del tipo de puesto.' : 'Introduce los datos del nuevo tipo de puesto.'}
        </p>
      </div>

      <form onSubmit={(e) => { void handleSubmit(e); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="jobtype-name" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
            Nombre <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="jobtype-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder="Nombre del tipo de puesto"
            autoFocus
            style={inputBase}
            onFocus={focusIn}
            onBlur={focusOut}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor="jobtype-sector" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
            Sector <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            id="jobtype-sector"
            value={sectorId}
            onChange={(e) => setSectorId(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            style={{ ...inputBase, cursor: 'pointer' }}
            onFocus={focusIn}
            onBlur={focusOut}
          >
            <option value="">Selecciona un sector...</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              background: saving ? '#93c5fd' : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
              color: '#fff', fontWeight: 700, fontSize: '14px',
              border: 'none', borderRadius: '10px', padding: '12px',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
            }}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1, background: '#fff', color: '#374151',
              fontWeight: 600, fontSize: '14px',
              border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '12px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
