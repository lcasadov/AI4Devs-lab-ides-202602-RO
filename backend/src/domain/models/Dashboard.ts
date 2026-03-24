export interface StatEntry {
  name: string;
  count: number;
}

export interface DashboardStats {
  byJobType: StatEntry[];
  byProvince: StatEntry[];
  byMunicipality: StatEntry[];
}
