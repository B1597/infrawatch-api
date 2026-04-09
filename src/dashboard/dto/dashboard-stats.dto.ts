export interface TrendDto {
  change: number;
  direction: 'up' | 'down';
}

export interface DashboardTrendsDto {
  totalNodes: TrendDto;
  warnings: TrendDto;
}

export interface DashboardStatsDto {
  totalNodes: number;
  online: number;
  warnings: number;
  offline: number;
  datacenters: number;
  racks: number;
  servers: number;
  vms: number;
  services: number;
  trends: DashboardTrendsDto;
}
