export interface NodeConfigDto {
  id: string;
  type: string;
  name: string;
  location?: string;
  password?: string;
  registrationId?: string;
  ipAddress?: string;
  macAddress?: string;
}

export interface UpdateNodeConfigDto {
  name?: string;
  location?: string;
  password?: string;
  registrationId?: string;
  ipAddress?: string;
}
