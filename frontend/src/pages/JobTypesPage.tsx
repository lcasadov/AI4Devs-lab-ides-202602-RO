import React, { useEffect, useState } from 'react';
import { JobTypeForm } from '../components/JobTypeForm';
import { useJobTypes } from '../hooks/useJobTypes';
import { JobType, JobTypeFilters } from '../types/jobtype.types';
import { Sector } from '../types/sector.types';
import { sectorService } from '../services/sector.service';
import { exportToExcel } from '../utils/exportExcel';

const ff = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const filterInput: React.CSSProperties = {
  border: '1px solid #e2e8f0', borderRadius: '6px',
  padding: '7px 10px', fontSize: '13px', color: '#374151',
  background: '#fff', outline: 'none',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
};

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
      [field]: field === 'sectorId' ? (value === '' ? undefined : parseInt(value, 10)) : (value || undefined),
    };
    setFilters(updated);
    void loadJobTypes(updated);
  }

  function handleExportExcel(): void {
    const rows = jobTypes.map((jt) => ({ nombre: jt.name, sector: jt.sector.name }));
    exportToExcel(rows, [{ header: 'Nombre', key: 'nombre' }, { header: 'Sector', key: 'sector' }], 'tipos-puesto');
  }

  function handleNew(): void { setEditingJobType(undefined); setShowForm(true); }
  function handleEdit(jt: JobType): void { setEditingJobType(jt); setShowForm(true); }
  function handleFormSave(): void { setShowForm(false); setEditingJobType(undefined); void loadJobTypes(filters); }
  function handleFormCancel(): void { setShowForm(false); setEditingJobType(undefined); }

  async function handleDelete(jt: JobType): Promise<void> {
    if (!window.confirm(`¿Eliminar el tipo de puesto "${jt.name}"?`)) return;
    try { await deleteJobType(jt.id); void loadJobTypes(filters); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error al eliminar'); }
  }

  if (showForm) {
    return (
      <div style={{ fontFamily: ff, minHeight: '100vh', background: '#f1f5f9' }}>
        <div style={{ background: '#1e3a5f', color: '#fff', padding: '0 32px', height: '48px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" onClick={handleFormCancel} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '6px', padding: '5px 12px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>← Volver</button>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{editingJobType ? 'Editar tipo de puesto' : 'Nuevo tipo de puesto'}</span>
        </div>
        <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '32px', width: '100%', maxWidth: '480px' }}>
            <JobTypeForm jobType={editingJobType} onSave={handleFormSave} onCancel={handleFormCancel} onCreate={createJobType} onUpdate={updateJobType} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: ff, minHeight: '100vh', background: '#f1f5f9' }}>
      <div style={{ background: '#1e3a5f', color: '#fff', padding: '0 32px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.3px' }}>TIPOS DE PUESTO</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={handleExportExcel} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontWeight: 600, fontSize: '13px', borderRadius: '7px', padding: '7px 14px', cursor: 'pointer' }}>↓ Excel</button>
          <button type="button" onClick={handleNew} style={{ background: '#2563eb', border: 'none', color: '#fff', fontWeight: 700, fontSize: '13px', borderRadius: '7px', padding: '7px 16px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.4)' }}>+ Nuevo tipo de puesto</button>
        </div>
      </div>

      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 32px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="Nombre..." value={filters.name ?? ''}
          onChange={(e) => handleFilterChange('name', e.target.value)}
          aria-label="Filtrar por nombre" style={{ ...filterInput, width: '180px' }} />
        <select value={filters.sectorId ?? ''} onChange={(e) => handleFilterChange('sectorId', e.target.value)}
          aria-label="Filtrar por sector" style={{ ...filterInput, width: '180px', cursor: 'pointer' }}>
          <option value="">Todos los sectores</option>
          {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: 'auto' }}>
          {jobTypes.length} registro{jobTypes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div role="alert" style={{ margin: '16px 32px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#dc2626' }}>⚠️ {error}</div>
      )}

      <div style={{ padding: '20px 32px' }}>
        <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <caption style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Tabla de tipos de puesto</caption>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Nombre', 'Sector', 'Acciones'].map((h) => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}><span role="status">Cargando...</span></td></tr>
              ) : jobTypes.length === 0 ? (
                <tr><td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No hay tipos de puesto</td></tr>
              ) : (
                jobTypes.map((jt, i) => (
                  <tr key={jt.id} onDoubleClick={() => handleEdit(jt)}
                    style={{ borderBottom: i < jobTypes.length - 1 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
                  >
                    <td style={{ padding: '11px 16px', color: '#0f172a', fontWeight: 500 }}>{jt.name}</td>
                    <td style={{ padding: '11px 16px', color: '#475569' }}>{jt.sector.name}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button type="button" onClick={() => handleEdit(jt)} aria-label={`Editar ${jt.name}`}
                          style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#dbeafe'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#eff6ff'; }}>
                          ✏ Editar
                        </button>
                        <button type="button" onClick={() => { void handleDelete(jt); }} aria-label={`Eliminar ${jt.name}`}
                          style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}>
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
