import React, { useEffect, useState } from 'react';
import { SectorForm } from '../components/SectorForm';
import { useSectors } from '../hooks/useSectors';
import { Sector } from '../types/sector.types';

export function SectorsPage(): JSX.Element {
  const { loading, error, loadSectors, createSector, updateSector, deleteSector, filterByName } = useSectors();

  const [showForm, setShowForm] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | undefined>(undefined);
  const [nameFilter, setNameFilter] = useState('');
  const [filteredSectors, setFilteredSectors] = useState<Sector[]>([]);

  useEffect(() => {
    void loadSectors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFilteredSectors(filterByName(nameFilter));
  }, [nameFilter, filterByName]);

  function handleFilterChange(value: string): void {
    setNameFilter(value);
    setFilteredSectors(filterByName(value));
  }

  function handleNew(): void {
    setEditingSector(undefined);
    setShowForm(true);
  }

  function handleEdit(sector: Sector): void {
    setEditingSector(sector);
    setShowForm(true);
  }

  function handleFormSave(): void {
    setShowForm(false);
    setEditingSector(undefined);
    void loadSectors();
  }

  function handleFormCancel(): void {
    setShowForm(false);
    setEditingSector(undefined);
  }

  async function handleDelete(sector: Sector): Promise<void> {
    const confirmed = window.confirm(`¿Estás seguro de que quieres eliminar el sector "${sector.name}"?`);
    if (!confirmed) return;
    try {
      await deleteSector(sector.id);
      void loadSectors();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al eliminar el sector');
    }
  }

  if (showForm) {
    return (
      <div className="p-8 flex justify-center">
        <SectorForm
          sector={editingSector}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
          onCreate={createSector}
          onUpdate={updateSector}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sectores</h1>
        <button
          type="button"
          onClick={handleNew}
          className="bg-blue-600 text-white font-semibold rounded-lg py-2 px-4 hover:bg-blue-700 transition-colors"
        >
          + Nuevo sector
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                <div className="flex flex-col gap-1">
                  <span>Nombre</span>
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={nameFilter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-gray-500">Cargando...</td>
              </tr>
            ) : filteredSectors.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-gray-500">No hay sectores</td>
              </tr>
            ) : (
              filteredSectors.map((s) => (
                <tr
                  key={s.id}
                  onDoubleClick={() => handleEdit(s)}
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-gray-900">{s.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(s)}
                        className="text-blue-600 hover:text-blue-800 text-xs underline"
                        aria-label={`Editar ${s.name}`}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => { void handleDelete(s); }}
                        className="text-red-600 hover:text-red-800 text-xs underline"
                        aria-label={`Eliminar ${s.name}`}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
