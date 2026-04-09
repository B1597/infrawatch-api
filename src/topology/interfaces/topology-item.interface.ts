export interface RawTopologyItem {
  id: string;
  kind: 'datacenter' | 'rack' | 'server' | 'switch' | 'router' | 'storage';
  label: string;
  status?: string;
  state?: string;
  location?: string;
  parent?: string;
  ip?: string;
  meta?: {
    floor?: string;
  };
}