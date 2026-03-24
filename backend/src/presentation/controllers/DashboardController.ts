import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../../application/services/DashboardService';
import { DashboardRepository } from '../../infrastructure/repositories/DashboardRepository';

const service = new DashboardService(new DashboardRepository());

export async function getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await service.getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
