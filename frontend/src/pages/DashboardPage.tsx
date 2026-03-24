import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, DashboardStats, StatEntry } from '../services/dashboard.service';

const ff = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

interface StatsPanelProps {
  title: string;
  icon: string;
  entries: StatEntry[];
  color: string;
}

function StatsPanel({ title, icon, entries, color }: StatsPanelProps): JSX.Element {
  const total = entries.reduce((sum, e) => sum + e.count, 0);
  return (
    <div style={{
      background: '#fff', borderRadius: '12px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      overflow: 'hidden',
    }} aria-label={title}>
      {/* Panel header */}
      <div style={{
        background: color, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>{title}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
            {total} candidato{total !== 1 ? 's' : ''} en total
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '0' }}>
        {entries.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
            Sin datos
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '10px 20px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre</th>
                <th style={{ padding: '10px 20px', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Candidatos</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr key={entry.name} style={{ borderBottom: i < entries.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <td style={{ padding: '9px 20px', color: '#374151' }}>{entry.name}</td>
                  <td style={{ padding: '9px 20px', textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block', minWidth: '32px',
                      background: '#f1f5f9', borderRadius: '12px',
                      padding: '2px 10px', fontWeight: 700, fontSize: '12px', color: '#0f172a',
                      textAlign: 'center',
                    }}>
                      {entry.count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export function DashboardPage(): JSX.Element {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDashboardStats()
      .then((data) => { setStats(data); })
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : 'Error al cargar las estadísticas'); })
      .finally(() => { setLoading(false); });
  }, []);

  return (
    <div style={{ fontFamily: ff, minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Title bar */}
      <div style={{ background: '#1e3a5f', color: '#fff', padding: '0 32px', height: '52px', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.3px' }}>DASHBOARD</span>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '14px' }}>
            <span role="status">Cargando estadísticas...</span>
          </div>
        )}

        {error && !loading && (
          <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 18px', fontSize: '13px', color: '#dc2626' }}>
            ⚠️ {error}
          </div>
        )}

        {stats && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <StatsPanel title="Por Tipo de Puesto" icon="💼" entries={stats.byJobType} color="#1e40af" />
            <StatsPanel title="Por Provincia" icon="📍" entries={stats.byProvince} color="#0f766e" />
            <StatsPanel title="Por Municipio" icon="🏙" entries={stats.byMunicipality} color="#6d28d9" />
          </div>
        )}
      </div>
    </div>
  );
}
