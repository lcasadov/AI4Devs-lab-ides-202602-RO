import React, { useEffect, useState } from 'react';
import { JobTypeForm } from '../components/JobTypeForm';
import { useJobTypes } from '../hooks/useJobTypes';
import { JobType, JobTypeFilters } from '../types/jobtype.types';
import { Sector } from '../types/sector.types';
import { sectorService } from '../services/sector.service';
import { exportToExcel } from '../utils/exportExcel';

export function JobTypesPage(): JSX.Element {
  const { jobTypes, loading, error, loadJobTypes, createJobType, updateJobType, deleteJobType } = useJobTypes();

  const [showForm, setShowForm] = useState(false);
  const [editingJobType, setEditingJobType] = useState<JobType | undefined>(undefined);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [filters, setFilters] = useState<JobTypeFilters>({});

  useEffect(() => {
    void loadJobTypes();
    sectorService.getAll().then(setSectors).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterChange(field: keyof JobTypeFilters, value: string): void {
    const updated: JobTypeFilters = {
      ...filters,
      [field]: field === 'sectorId'
        ? (value === '' ? undefined : parseInt(value, 10))
        : (value || undefined),
    };
    setFilters(updated);
    void loadJobTypes(updated);
  }

  function handleExportExcel(): void {
    const rows = jobTypes.map((jt) => ({
      nombre: jt.name,
      sector: jt.sector.name,
    }));
    exportToExcel(rows, [
      { header: 'Nombre', key: 'nombre' },
      { header: 'Sector', key: 'sector' },
    ], 'tipos-puesto');
  }

  function handleNew(): void {
    setEditingJobType(undefined);
    setShowForm(true);
  }

  function handleEdit(jt: JobType): void {
    setEditingJobType(jt);
    setShowForm(true);
  }

  function handleFormSave(): void {
    setShowForm(false);
    setEditingJobType(undefined);
    void loadJobTypes(filters);
  }

  function handleFormCancel(): void {
    setShowForm(false);
    setEditingJobType(undefined);
  }

  async function handleDelete(jt: JobType): Promise<void> {
    const confirmed = window.confirm(`¿Estás seguro de que quieres eliminar el tipo de puesto "${jt.name}"?`);
    if (!confirmed) return;
    try {
      await deleteJobType(jt.id);
      void loadJobTypes(filters);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al eliminar el tipo de puesto');
    }
  }

  if (showForm) {
    return (
      <div className="p-8 flex justify-center">
        <JobTypeForm
          jobType={editingJobType}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
          onCreate={createJobType}
          onUpdate={updateJobType}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tipos de puesto</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportExcel}
            className="bg-green-600 text-white font-semibold rounded-lg py-2 px-4 hover:bg-green-700 transition-colors"
          >
            Exportar Excel
          </button>
          <button
            type="button"
            onClick={handleNew}
            className="bg-blue-600 text-white font-semibold rounded-lg py-2 px-4 hover:bg-blue-700 transition-colors"
          >
            + Nuevo tipo de puesto
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <caption className="sr-only">Tabla de tipos de puesto</caption>
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                <div className="flex flex-col gap-1">
                  <span>Nombre</span>
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    aria-label="Filtrar por nombre"
                    value={filters.name ?? ''}
                    onChange={(e) => handleFilterChange('name', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                <div className="flex flex-col gap-1">
                  <span>Sector</span>
                  <select
                    value={filters.sectorId ?? ''}
                    aria-label="Filtrar por sector"
                    onChange={(e) => handleFilterChange('sectorId', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    {sectors.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500"><span role="status">Cargando...</span></td>
              </tr>
            ) : jobTypes.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">No hay tipos de puesto</td>
              </tr>
            ) : (
              jobTypes.map((jt) => (
                <tr
                  key={jt.id}
                  onDoubleClick={() => handleEdit(jt)}
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-gray-900">{jt.name}</td>
                  <td className="px-4 py-3 text-gray-700">{jt.sector.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(jt)}
                        className="text-blue-600 hover:text-blue-800 text-xs underline"
                        aria-label={`Editar ${jt.name}`}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => { void handleDelete(jt); }}
                        className="text-red-600 hover:text-red-800 text-xs underline"
                        aria-label={`Eliminar ${jt.name}`}
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
