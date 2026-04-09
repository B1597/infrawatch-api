import { Injectable } from '@nestjs/common';
import statsRaw from './data/stats.json';
import healthRaw from './data/health.json';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { DashboardHealthDto } from './dto/dashboard-health.dto';

@Injectable()
export class DashboardService {
  getStats(): DashboardStatsDto {
    return statsRaw as DashboardStatsDto;
  }

  getHealth(): DashboardHealthDto {
    return healthRaw as DashboardHealthDto;
  }
}
