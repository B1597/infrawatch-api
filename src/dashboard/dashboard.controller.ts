import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { DashboardHealthDto } from './dto/dashboard-health.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOkResponse({ type: DashboardStatsDto })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('health')
  @ApiOkResponse({ type: DashboardHealthDto })
  getHealth() {
    return this.dashboardService.getHealth();
  }
}
