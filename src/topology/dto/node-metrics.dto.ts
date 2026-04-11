import { ApiProperty } from '@nestjs/swagger';

export class NodeMetricSeriesDto {
  @ApiProperty({ type: [Number] })
  '1H'!: number[];

  @ApiProperty({ type: [Number] })
  '6H'!: number[];

  @ApiProperty({ type: [Number] })
  '24H'!: number[];

  @ApiProperty({ type: [Number] })
  '7D'!: number[];
}

export class NodeNetworkSeriesDto {
  @ApiProperty({ type: [Number] })
  in!: number[];

  @ApiProperty({ type: [Number] })
  out!: number[];
}

export class NodeNetworkMetricDto {
  @ApiProperty({ type: () => NodeNetworkSeriesDto })
  '1H'!: NodeNetworkSeriesDto;

  @ApiProperty({ type: () => NodeNetworkSeriesDto })
  '6H'!: NodeNetworkSeriesDto;

  @ApiProperty({ type: () => NodeNetworkSeriesDto })
  '24H'!: NodeNetworkSeriesDto;

  @ApiProperty({ type: () => NodeNetworkSeriesDto })
  '7D'!: NodeNetworkSeriesDto;
}

export class NodeMetricsDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: () => NodeMetricSeriesDto })
  cpu!: NodeMetricSeriesDto;

  @ApiProperty({ type: () => NodeMetricSeriesDto })
  memory!: NodeMetricSeriesDto;

  @ApiProperty({ type: () => NodeNetworkMetricDto })
  network!: NodeNetworkMetricDto;
}
