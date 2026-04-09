export interface NodeMetricSeriesDto {
  '1H': number[];
  '6H': number[];
  '24H': number[];
  '7D': number[];
}

export interface NodeNetworkSeriesDto {
  in: number[];
  out: number[];
}

export interface NodeNetworkMetricDto {
  '1H': NodeNetworkSeriesDto;
  '6H': NodeNetworkSeriesDto;
  '24H': NodeNetworkSeriesDto;
  '7D': NodeNetworkSeriesDto;
}

export interface NodeMetricsDto {
  id: string;
  cpu: NodeMetricSeriesDto;
  memory: NodeMetricSeriesDto;
  network: NodeNetworkMetricDto;
}
