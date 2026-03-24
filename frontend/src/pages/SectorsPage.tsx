import React, { useEffect, useState } from 'react';
import { SectorForm } from '../components/SectorForm';
import { useSectors } from '../hooks/useSectors';
import { Sector } from '../types/sector.types';
import { exportToExcel } from '../utils/exportExcel';

const ff = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const filterInput: React.CSSProperties = {
  border: '1px solid #e2e8f0', borderRadius: '6px',
  padding: '7px 10px', fontSize: '13px', color: '#374151',
  background: '#fff', outline: 'none',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
};

export function SectorsPage(): JSX.Element {
  const { loading, error, loadSectors, createSector, updateSector, deleteSector, filterByName } = useSectors();

  const [showForm, setShowForm] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | undefined>(undefined);
  const [nameFilter, setNameFilter] = useState('');
  const [filteredSectors, setFilteredSectors] = useState<Sector[]>([]);

  useEffect(() => { void loadSectors(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  useEffect(() => { setFilteredSectors(filterByName(nameFilter)); }, [nameFilter, filterByName]);

  function handleFilterChange(value: string): void {
    setNameFilter(value);
    setFilteredSectors(filterByName(value));
  }

  function handleExportExcel(): void {
    const rows = filteredSectors.map((s) => ({ nombre: s.name }));
    void exportToExcel(rows, [{ header: 'Nombre', key: 'nombre' }], 'sectores');
  }

  function handleNew(): void { setEditingSector(undefined); setShowForm(true); }
  function handleEdit(sector: Sector): void { setEditingSector(sector); setShowForm(true); }
  function handleFormSave(): void { setShowForm(false); setEditingSector(undefined); void loadSectors(); }
  function handleFormCancel(): void { setShowForm(false); setEditingSector(undefined); }

  async function handleDelete(sector: Sector): Promise<void> {
    if (!window.confirm(`¿Eliminar el sector "${sector.name}"?`)) return;
    try { await deleteSector(sector.id); void loadSectors(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : 'Error al eliminar el sector'); }
  }

  if (showForm) {
    return (
      <div style={{ fontFamily: ff, minHeight: '100vh', background: '#f1f5f9' }}>
        <div style={{
          background: '#1e3a5f', color: '#fff', padding: '0 32px',
          height: '48px', display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <button type="button" onClick={handleFormCancel} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
            borderRadius: '6px', padding: '5px 12px', fontSize: '13px', cursor: 'pointer', fontWeight: 600,
          }}>← Volver</button>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{editingSector ? 'Editar sector' : 'Nuevo sector'}</span>
        </div>
        <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '32px', width: '100%', maxWidth: '440px' }}>
            <SectorForm sector={editingSector} onSave={handleFormSave} onCancel={handleFormCancel} onCreate={createSector} onUpdate={updateSector} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: ff, minHeight: '100vh', background: '#f1f5f9' }}>
      <div style={{ background: '#1e3a5f', color: '#fff', padding: '0 32px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.3px' }}>SECTORES</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={handleExportExcel} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontWeight: 600, fontSize: '13px', borderRadius: '7px', padding: '7px 14px', cursor: 'pointer' }}>↓ Excel</button>
          <button type="button" onClick={handleNew} style={{ background: '#2563eb', border: 'none', color: '#fff', fontWeight: 700, fontSize: '13px', borderRadius: '7px', padding: '7px 16px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.4)' }}>+ Nuevo sector</button>
        </div>
      </div>

      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 32px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input type="text" placeholder="Buscar sector..." value={nameFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          aria-label="Filtrar por nombre" style={{ ...filterInput, width: '220px' }} />
        <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: 'auto' }}>
          {filteredSectors.length} registro{filteredSectors.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div role="alert" style={{ margin: '16px 32px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#dc2626' }}>⚠️ {error}</div>
      )}

      <div style={{ padding: '20px 32px' }}>
        <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <caption style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Tabla de sectores</caption>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre</th>
                <th style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '140px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={2} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}><span role="status">Cargando...</span></td></tr>
              ) : filteredSectors.length === 0 ? (
                <tr><td colSpan={2} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No hay sectores</td></tr>
              ) : (
                filteredSectors.map((s, i) => (
                  <tr key={s.id} onDoubleClick={() => handleEdit(s)}
                    style={{ borderBottom: i < filteredSectors.length - 1 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
                  >
                    <td style={{ padding: '11px 16px', color: '#0f172a', fontWeight: 500 }}>{s.name}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button type="button" onClick={() => handleEdit(s)} aria-label={`Editar ${s.name}`}
                          style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#dbeafe'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#eff6ff'; }}>
                          ✏ Editar
                        </button>
                        <button type="button" onClick={() => { void handleDelete(s); }} aria-label={`Eliminar ${s.name}`}
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
