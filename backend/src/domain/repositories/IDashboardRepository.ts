import { DashboardStats } from '../models/Dashboard';

export interface IDashboardRepository {
  getStats(): Promise<DashboardStats>;
}
