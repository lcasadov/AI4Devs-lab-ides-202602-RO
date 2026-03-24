import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, DashboardStats, StatEntry } from '../services/dashboard.service';

interface StatsPanelProps {
  title: string;
  entries: StatEntry[];
}

function StatsPanel({ title, entries }: StatsPanelProps): JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow p-4" aria-label={title}>
      <h2 className="text-lg font-semibold text-gray-800 mb-3">{title}</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-1 text-gray-600 font-medium">Nombre</th>
            <th className="text-right py-1 text-gray-600 font-medium">Candidatos</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.name} className="border-b border-gray-100 last:border-0">
              <td className="py-1 text-gray-700">{entry.name}</td>
              <td className="py-1 text-right font-medium text-gray-900">{entry.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardPage(): JSX.Element {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('No hay sesión activa');
      return;
    }

    setLoading(true);
    setError(null);

    getDashboardStats(token)
      .then((data) => {
        setStats(data);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Error al cargar las estadísticas');
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {loading && (
        <p className="text-gray-500" role="status">Cargando...</p>
      )}

      {error && !loading && (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4"
          role="alert"
        >
          {error}
        </div>
      )}

      {stats && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StatsPanel title="Por Tipo de Puesto" entries={stats.byJobType} />
          <StatsPanel title="Por Provincia" entries={stats.byProvince} />
          <StatsPanel title="Por Municipio" entries={stats.byMunicipality} />
        </div>
      )}
    </div>
  );
}
