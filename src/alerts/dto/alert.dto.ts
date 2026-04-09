export interface AlertDto {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'active' | 'acknowledged' | 'resolved';
  source: string;
  deviceType: string;
  category: string;
  time: string;
  timestamp: string;
  acknowledgedBy?: string;
}
