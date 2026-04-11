import { NodeType } from '../types/node-type.enum';

export interface RawTopologyItem {
  id: string;
  type: NodeType;
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
