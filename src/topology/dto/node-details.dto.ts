export interface NodeHardwareDto {
  cpuCores: number;
  memory: string;
  storage: string;
  firmware: string;
}

export interface NodeStatsDto {
  cpuUsage: number;
  memoryUsage: number;
  networkIO: string;
  networkOut: string;
  uptimeDays: number;
  availability: string;
}

export interface NodeDetailsDto {
  id: string;
  name: string;
  type: string;
  status: string;
  location?: string;
  ipAddress?: string;
  parentId?: string;
  vendor: string;
  serialNumber: string;
  hardware: NodeHardwareDto;
  stats: NodeStatsDto;
}
