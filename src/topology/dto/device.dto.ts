export interface DeviceDto {
  id: string;
  name: string;
  type: 'server' | 'switch' | 'router' | 'storage';
  status: string;
  ipAddress: string;
  parentId: string;
}