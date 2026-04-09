import { Injectable, NotFoundException } from '@nestjs/common';
import alertsRaw from './data/alerts.json';
import { AlertDto } from './dto/alert.dto';

@Injectable()
export class AlertsService {
  private readonly alerts: AlertDto[] = alertsRaw as AlertDto[];

  getAlerts(): AlertDto[] {
    return this.alerts;
  }

  getAlertById(id: string): AlertDto {
    const alert = this.alerts.find((alert) => alert.id === id);
    if (!alert) throw new NotFoundException(`Alert ${id} not found`);
    return alert;
  }
}
