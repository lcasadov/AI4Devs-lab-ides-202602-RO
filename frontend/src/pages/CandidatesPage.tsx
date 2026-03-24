import React, { useEffect, useMemo, useState } from 'react';
import { CandidateForm } from '../components/CandidateForm';
import { useCandidates } from '../hooks/useCandidates';
import { sectorService } from '../services/sector.service';
import { jobtypeService } from '../services/jobtype.service';
import { Candidate } from '../types/candidate';
import { Sector } from '../types/sector.types';
import { JobType } from '../types/jobtype.types';
import { exportToExcel } from '../utils/exportExcel';

const ff = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const filterInput: React.CSSProperties = {
  border: '1px solid #e2e8f0', borderRadius: '6px',
  padding: '7px 10px', fontSize: '13px', color: '#374151',
  background: '#fff', outline: 'none',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
};

export function CandidatesPage(): JSX.Element {
  const { candidates, isLoading, error, loadCandidates, deleteCandidate } = useCandidates();

  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | undefined>(undefined);

  const [filterFirstName, setFilterFirstName] = useState('');
  const [filterLastName, setFilterLastName] = useState('');
  const [filterSectorId, setFilterSectorId] = useState<number | ''>('');
  const [filterJobTypeId, setFilterJobTypeId] = useState<number | ''>('');

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [filterJobTypes, setFilterJobTypes] = useState<JobType[]>([]);

  useEffect(() => {
    void loadCandidates();
    sectorService.getAll().then(setSectors).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (filterFirstName && !c.firstName.toLowerCase().includes(filterFirstName.toLowerCase())) return false;
      if (filterLastName && !c.lastName.toLowerCase().includes(filterLastName.toLowerCase())) return false;
      if (filterSectorId !== '' && c.sector?.id !== filterSectorId) return false;
      if (filterJobTypeId !== '' && c.jobType?.id !== filterJobTypeId) return false;
      return true;
    });
  }, [candidates, filterFirstName, filterLastName, filterSectorId, filterJobTypeId]);

  function handleExportExcel(): void {
    const rows = filteredCandidates.map((c) => ({
      nombre: c.firstName, apellido: c.lastName, email: c.email,
      telefono: c.phone ?? '', provincia: c.province ?? '',
      municipio: c.municipality ?? '', sector: c.sector?.name ?? '',
      tipoPuesto: c.jobType?.name ?? '',
    }));
    exportToExcel(rows, [
      { header: 'Nombre', key: 'nombre' }, { header: 'Apellido', key: 'apellido' },
      { header: 'Email', key: 'email' }, { header: 'Teléfono', key: 'telefono' },
      { header: 'Provincia', key: 'provincia' }, { header: 'Municipio', key: 'municipio' },
      { header: 'Sector', key: 'sector' }, { header: 'Tipo de Puesto', key: 'tipoPuesto' },
    ], 'candidatos');
  }

  function handleNew(): void { setEditingCandidate(undefined); setShowForm(true); }
  function handleEdit(c: Candidate): void { setEditingCandidate(c); setShowForm(true); }
  function handleFormSuccess(): void { setShowForm(false); setEditingCandidate(undefined); void loadCandidates(); }
  function handleFormCancel(): void { setShowForm(false); setEditingCandidate(undefined); }

  async function handleDelete(c: Candidate): Promise<void> {
    if (!window.confirm(`¿Eliminar al candidato "${c.firstName} ${c.lastName}"?`)) return;
    try { await deleteCandidate(c.id); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error al eliminar'); }
  }

  if (showForm) {
    return (
      <div style={{ fontFamily: ff, minHeight: '100vh', background: '#f1f5f9' }}>
        {/* Back bar */}
        <div style={{
          background: '#1e3a5f', color: '#fff', padding: '0 32px',
          height: '48px', display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <button
            type="button" onClick={handleFormCancel}
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
              borderRadius: '6px', padding: '5px 12px', fontSize: '13px',
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            ← Volver
          </button>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>
            {editingCandidate ? 'Editar candidato' : 'Nuevo candidato'}
          </span>
        </div>
        <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            background: '#fff', borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            padding: '32px', width: '100%', maxWidth: '720px',
          }}>
            <CandidateForm
              candidate={editingCandidate}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: ff, minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Title bar */}
      <div style={{
        background: '#1e3a5f', color: '#fff',
        padding: '0 32px', height: '52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.3px' }}>
          CANDIDATOS
        </span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button" onClick={handleExportExcel}
            style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', fontWeight: 600, fontSize: '13px',
              borderRadius: '7px', padding: '7px 14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            ↓ Excel
          </button>
          <button
            type="button" onClick={handleNew}
            style={{
              background: '#2563eb', border: 'none',
              color: '#fff', fontWeight: 700, fontSize: '13px',
              borderRadius: '7px', padding: '7px 16px', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37,99,235,0.4)',
            }}
          >
            + Nuevo candidato
          </button>
        </div>
      </div>

      {/* Filters toolbar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '12px 32px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <input
          type="text" placeholder="Nombre..." value={filterFirstName}
          onChange={(e) => setFilterFirstName(e.target.value)}
          aria-label="Filtrar por nombre" style={{ ...filterInput, width: '140px' }}
        />
        <input
          type="text" placeholder="Apellido..." value={filterLastName}
          onChange={(e) => setFilterLastName(e.target.value)}
          aria-label="Filtrar por apellido" style={{ ...filterInput, width: '140px' }}
        />
        <select
          value={filterSectorId}
          onChange={(e) => setFilterSectorId(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
          aria-label="Filtrar por sector"
          style={{ ...filterInput, width: '160px', cursor: 'pointer' }}
        >
          <option value="">Todos los sectores</option>
          {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select
          value={filterJobTypeId}
          onChange={(e) => setFilterJobTypeId(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
          disabled={filterSectorId === ''}
          aria-label="Filtrar por tipo de puesto"
          style={{ ...filterInput, width: '160px', cursor: filterSectorId === '' ? 'not-allowed' : 'pointer', background: filterSectorId === '' ? '#f8fafc' : '#fff' }}
        >
          <option value="">Todos los tipos</option>
          {filterJobTypes.map((jt) => <option key={jt.id} value={jt.id}>{jt.name}</option>)}
        </select>
        <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: 'auto' }}>
          {filteredCandidates.length} registro{filteredCandidates.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" style={{
          margin: '16px 32px', background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#dc2626',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Table */}
      <div style={{ padding: '20px 32px' }}>
        <div style={{
          background: '#fff', borderRadius: '10px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <caption style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
              Tabla de candidatos
            </caption>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Nombre', 'Apellido', 'Email', 'Teléfono', 'Sector', 'Tipo de puesto', 'Acciones'].map((h) => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    <span role="status">Cargando...</span>
                  </td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    No hay candidatos
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c, i) => (
                  <tr
                    key={c.id}
                    onDoubleClick={() => handleEdit(c)}
                    style={{
                      borderBottom: i < filteredCandidates.length - 1 ? '1px solid #f1f5f9' : 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
                  >
                    <td style={{ padding: '11px 16px', color: '#0f172a', fontWeight: 500 }}>{c.firstName}</td>
                    <td style={{ padding: '11px 16px', color: '#0f172a', fontWeight: 500 }}>{c.lastName}</td>
                    <td style={{ padding: '11px 16px', color: '#475569' }}>{c.email}</td>
                    <td style={{ padding: '11px 16px', color: '#475569' }}>{c.phone ?? '—'}</td>
                    <td style={{ padding: '11px 16px', color: '#475569' }}>{c.sector?.name ?? '—'}</td>
                    <td style={{ padding: '11px 16px', color: '#475569' }}>{c.jobType?.name ?? '—'}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button" onClick={() => handleEdit(c)}
                          aria-label={`Editar ${c.firstName} ${c.lastName}`}
                          style={{
                            background: '#eff6ff', color: '#2563eb', border: 'none',
                            borderRadius: '6px', padding: '5px 10px', fontSize: '12px',
                            fontWeight: 600, cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#dbeafe'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#eff6ff'; }}
                        >
                          ✏ Editar
                        </button>
                        <button
                          type="button" onClick={() => { void handleDelete(c); }}
                          aria-label={`Eliminar ${c.firstName} ${c.lastName}`}
                          style={{
                            background: '#fef2f2', color: '#dc2626', border: 'none',
                            borderRadius: '6px', padding: '5px 10px', fontSize: '12px',
                            fontWeight: 600, cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                        >
                          ✕
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
    </div>
  );
}
