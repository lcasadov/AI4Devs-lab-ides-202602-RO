import React, { useState, useEffect } from 'react';
import { Sector, CreateSectorRequest, UpdateSectorRequest } from '../types/sector.types';

interface SectorFormProps {
  sector?: Sector;
  onSave: () => void;
  onCancel: () => void;
  onCreate: (dto: CreateSectorRequest) => Promise<void>;
  onUpdate: (id: number, dto: UpdateSectorRequest) => Promise<void>;
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
    <div className="bg-white rounded-xl shadow p-6 w-full max-w-md">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {isEditing ? 'Editar sector' : 'Nuevo sector'}
      </h2>
      <form onSubmit={(e) => { void handleSubmit(e); }}>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4" role="alert">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="sector-name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="sector-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre del sector"
            autoFocus
          />
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
