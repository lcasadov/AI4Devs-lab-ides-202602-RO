import { getPrismaClient } from '../database/prisma-client';
import { IDashboardRepository } from '../../domain/repositories/IDashboardRepository';
import { DashboardStats, StatEntry } from '../../domain/models/Dashboard';

export class DashboardRepository implements IDashboardRepository {
  async getStats(): Promise<DashboardStats> {
    const prisma = getPrismaClient();

    // byJobType
    const jobTypeGroups = await prisma.candidate.groupBy({
      by: ['jobTypeId'],
      _count: { _all: true },
      where: { jobTypeId: { not: null } },
    });
    const jobTypeIds = jobTypeGroups.map(g => g.jobTypeId as number);
    const jobTypes = jobTypeIds.length > 0
      ? await prisma.jobType.findMany({ where: { id: { in: jobTypeIds } }, select: { id: true, name: true } })
      : [];
    const jobTypeMap = new Map(jobTypes.map(jt => [jt.id, jt.name]));
    const byJobType: StatEntry[] = jobTypeGroups
      .map(g => ({ name: jobTypeMap.get(g.jobTypeId as number) ?? 'Unknown', count: g._count._all }))
      .sort((a, b) => b.count - a.count);

    // byProvince
    const provinceGroups = await prisma.candidate.groupBy({
      by: ['province'],
      _count: { _all: true },
    });
    const byProvince: StatEntry[] = provinceGroups
      .map(g => ({ name: g.province ?? 'Sin provincia', count: g._count._all }))
      .sort((a, b) => b.count - a.count);

    // byMunicipality
    const municipalityGroups = await prisma.candidate.groupBy({
      by: ['municipality'],
      _count: { _all: true },
    });
    const byMunicipality: StatEntry[] = municipalityGroups
      .map(g => ({ name: g.municipality ?? 'Sin municipio', count: g._count._all }))
      .sort((a, b) => b.count - a.count);

    return { byJobType, byProvince, byMunicipality };
  }
}
