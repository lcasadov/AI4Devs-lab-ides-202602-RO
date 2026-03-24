import React, { useState, useEffect } from 'react';
import { Sector, CreateSectorRequest, UpdateSectorRequest } from '../types/sector.types';

interface SectorFormProps {
  sector?: Sector;
  onSave: () => void;
  onCancel: () => void;
  onCreate: (dto: CreateSectorRequest) => Promise<void>;
  onUpdate: (id: number, dto: UpdateSectorRequest) => Promise<void>;
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

function onFocus(e: React.FocusEvent<HTMLInputElement>): void {
  e.target.style.borderColor = '#3b82f6';
  e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
}
function onBlur(e: React.FocusEvent<HTMLInputElement>): void {
  e.target.style.borderColor = '#e2e8f0';
  e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
}

export function SectorForm({ sector, onSave, onCancel, onCreate, onUpdate }: SectorFormProps): JSX.Element {
  const [name, setName] = useState(sector?.name ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isEditing = sector !== undefined;

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
    setSaving(true);
    setError(null);
    try {
      if (isEditing && sector) {
        await onUpdate(sector.id, { name: name.trim() });
      } else {
        await onCreate({ name: name.trim() });
      }
      onSave();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el sector');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ fontFamily: ff }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '4px', letterSpacing: '-0.3px' }}>
          {isEditing ? 'Editar sector' : 'Nuevo sector'}
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          {isEditing ? 'Modifica el nombre del sector.' : 'Introduce el nombre del nuevo sector.'}
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
          <label htmlFor="sector-name" style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
            Nombre <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="sector-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder="Nombre del sector"
            autoFocus
            style={inputBase}
            onFocus={onFocus}
            onBlur={onBlur}
          />
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
            onMouseEnter={(e) => { (e.currentTarget).style.background = '#f8fafc'; }}
            onMouseLeave={(e) => { (e.currentTarget).style.background = '#fff'; }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
