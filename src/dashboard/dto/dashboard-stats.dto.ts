import { ApiProperty } from '@nestjs/swagger';

export class TrendDto {
  @ApiProperty()
  change!: number;

  @ApiProperty()
  direction!: 'up' | 'down';
}

export class DashboardTrendsDto {
  @ApiProperty({ type: TrendDto })
  totalNodes!: TrendDto;

  @ApiProperty({ type: TrendDto })
  warnings!: TrendDto;
}

export class DashboardStatsDto {
  @ApiProperty()
  totalNodes!: number;

  @ApiProperty()
  online!: number;

  @ApiProperty()
  warnings!: number;

  @ApiProperty()
  offline!: number;

  @ApiProperty()
  datacenters!: number;

  @ApiProperty()
  racks!: number;

  @ApiProperty()
  servers!: number;

  @ApiProperty()
  vms!: number;

  @ApiProperty()
  services!: number;

  @ApiProperty({ type: DashboardTrendsDto })
  trends!: DashboardTrendsDto;
}
