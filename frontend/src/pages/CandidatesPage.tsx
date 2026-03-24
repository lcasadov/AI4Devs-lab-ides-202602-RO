import React, { useEffect, useMemo, useState } from 'react';
import { CandidateForm } from '../components/CandidateForm';
import { useCandidates } from '../hooks/useCandidates';
import { sectorService } from '../services/sector.service';
import { jobtypeService } from '../services/jobtype.service';
import { Candidate } from '../types/candidate';
import { Sector } from '../types/sector.types';
import { JobType } from '../types/jobtype.types';
import { exportToExcel } from '../utils/exportExcel';

export function CandidatesPage(): JSX.Element {
  const { candidates, isLoading, error, loadCandidates, deleteCandidate } = useCandidates();

  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | undefined>(undefined);

  // Filter state
  const [filterFirstName, setFilterFirstName] = useState('');
  const [filterLastName, setFilterLastName] = useState('');
  const [filterSectorId, setFilterSectorId] = useState<number | ''>('');
  const [filterJobTypeId, setFilterJobTypeId] = useState<number | ''>('');

  // Data for filter combos
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [filterJobTypes, setFilterJobTypes] = useState<JobType[]>([]);

  useEffect(() => {
    void loadCandidates();
    sectorService.getAll().then(setSectors).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load job types for filter when filter sector changes
  useEffect(() => {
    if (filterSectorId === '') {
      setFilterJobTypes([]);
      setFilterJobTypeId('');
      return;
    }
    jobtypeService.getAll({ sectorId: filterSectorId as number })
      .then(setFilterJobTypes)
      .catch(() => undefined);
    setFilterJobTypeId('');
  }, [filterSectorId]);

  // Client-side filtering
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (
        filterFirstName &&
        !c.firstName.toLowerCase().includes(filterFirstName.toLowerCase())
      ) {
        return false;
      }
      if (
        filterLastName &&
        !c.lastName.toLowerCase().includes(filterLastName.toLowerCase())
      ) {
        return false;
      }
      if (filterSectorId !== '' && c.sector?.id !== filterSectorId) {
        return false;
      }
      if (filterJobTypeId !== '' && c.jobType?.id !== filterJobTypeId) {
        return false;
      }
      return true;
    });
  }, [candidates, filterFirstName, filterLastName, filterSectorId, filterJobTypeId]);

  function handleExportExcel(): void {
    const rows = filteredCandidates.map((c) => ({
      nombre: c.firstName,
      apellido: c.lastName,
      email: c.email,
      telefono: c.phone ?? '',
      provincia: c.province ?? '',
      municipio: c.municipality ?? '',
      sector: c.sector?.name ?? '',
      tipoPuesto: c.jobType?.name ?? '',
    }));
    exportToExcel(rows, [
      { header: 'Nombre', key: 'nombre' },
      { header: 'Apellido', key: 'apellido' },
      { header: 'Email', key: 'email' },
      { header: 'Teléfono', key: 'telefono' },
      { header: 'Provincia', key: 'provincia' },
      { header: 'Municipio', key: 'municipio' },
      { header: 'Sector', key: 'sector' },
      { header: 'Tipo de Puesto', key: 'tipoPuesto' },
    ], 'candidatos');
  }

  function handleNew(): void {
    setEditingCandidate(undefined);
    setShowForm(true);
  }

  function handleEdit(c: Candidate): void {
    setEditingCandidate(c);
    setShowForm(true);
  }

  function handleFormSuccess(): void {
    setShowForm(false);
    setEditingCandidate(undefined);
    void loadCandidates();
  }

  function handleFormCancel(): void {
    setShowForm(false);
    setEditingCandidate(undefined);
  }

  async function handleDelete(c: Candidate): Promise<void> {
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar al candidato "${c.firstName} ${c.lastName}"?`
    );
    if (!confirmed) return;
    try {
      await deleteCandidate(c.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al eliminar el candidato');
    }
  }

  function handleFilterSectorChange(value: string): void {
    setFilterSectorId(value === '' ? '' : parseInt(value, 10));
  }

  function handleFilterJobTypeChange(value: string): void {
    setFilterJobTypeId(value === '' ? '' : parseInt(value, 10));
  }

  if (showForm) {
    return (
      <div className="p-8 flex justify-center">
        <CandidateForm
          candidate={editingCandidate}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Candidatos</h1>
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
            + Nuevo candidato
          </button>
        </div>
      </div>

      {error && (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4"
          role="alert"
        >
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
                    value={filterFirstName}
                    onChange={(e) => setFilterFirstName(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                <div className="flex flex-col gap-1">
                  <span>Apellido</span>
                  <input
                    type="text"
                    placeholder="Filtrar..."
                    value={filterLastName}
                    onChange={(e) => setFilterLastName(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Teléfono</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                <div className="flex flex-col gap-1">
                  <span>Sector</span>
                  <select
                    value={filterSectorId}
                    onChange={(e) => handleFilterSectorChange(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    {sectors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                <div className="flex flex-col gap-1">
                  <span>Tipo de puesto</span>
                  <select
                    value={filterJobTypeId}
                    onChange={(e) => handleFilterJobTypeChange(e.target.value)}
                    disabled={filterSectorId === ''}
                    className="border border-gray-300 rounded px-2 py-1 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Todos</option>
                    {filterJobTypes.map((jt) => (
                      <option key={jt.id} value={jt.id}>
                        {jt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No hay candidatos
                </td>
              </tr>
            ) : (
              filteredCandidates.map((c) => (
                <tr
                  key={c.id}
                  onDoubleClick={() => handleEdit(c)}
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-gray-900">{c.firstName}</td>
                  <td className="px-4 py-3 text-gray-900">{c.lastName}</td>
                  <td className="px-4 py-3 text-gray-700">{c.email}</td>
                  <td className="px-4 py-3 text-gray-700">{c.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{c.sector?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{c.jobType?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(c)}
                        className="text-blue-600 hover:text-blue-800 text-xs underline"
                        aria-label={`Editar ${c.firstName} ${c.lastName}`}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => { void handleDelete(c); }}
                        className="text-red-600 hover:text-red-800 text-xs underline"
                        aria-label={`Eliminar ${c.firstName} ${c.lastName}`}
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
