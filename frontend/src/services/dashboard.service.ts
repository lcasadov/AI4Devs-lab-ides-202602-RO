const API_BASE = process.env['REACT_APP_API_URL'] ?? 'http://localhost:3010';

export interface StatEntry {
  name: string;
  count: number;
}

export interface DashboardStats {
  byJobType: StatEntry[];
  byProvince: StatEntry[];
  byMunicipality: StatEntry[];
}

export async function getDashboardStats(token: string): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/dashboard/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${res.status}`);
  }
  return res.json() as Promise<DashboardStats>;
}
