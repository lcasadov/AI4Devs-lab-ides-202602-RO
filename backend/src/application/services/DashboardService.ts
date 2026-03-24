import { IDashboardRepository } from '../../domain/repositories/IDashboardRepository';
import { DashboardStats } from '../../domain/models/Dashboard';

export class DashboardService {
  constructor(private readonly repo: IDashboardRepository) {}

  async getStats(): Promise<DashboardStats> {
    return this.repo.getStats();
  }
}
