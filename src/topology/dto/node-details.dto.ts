import { ApiProperty } from '@nestjs/swagger';

export class NodeHardwareDto {
  @ApiProperty()
  cpuCores!: number;

  @ApiProperty()
  memory!: string;

  @ApiProperty()
  storage!: string;

  @ApiProperty()
  firmware!: string;
}

export class NodeStatsDto {
  @ApiProperty()
  cpuUsage!: number;

  @ApiProperty()
  memoryUsage!: number;

  @ApiProperty()
  networkIO!: string;

  @ApiProperty()
  networkOut!: string;

  @ApiProperty()
  uptimeDays!: number;

  @ApiProperty()
  availability!: string;
}

export class NodeDetailsDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty({ required: false })
  ipAddress?: string;

  @ApiProperty({ required: false })
  parentId?: string;

  @ApiProperty()
  vendor!: string;

  @ApiProperty()
  serialNumber!: string;

  @ApiProperty({ type: () => NodeHardwareDto })
  hardware!: NodeHardwareDto;

  @ApiProperty({ type: () => NodeStatsDto })
  stats!: NodeStatsDto;
}
