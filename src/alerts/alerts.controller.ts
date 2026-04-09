import { Controller, Get, Param } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  getAlerts() {
    return this.alertsService.getAlerts();
  }

  @Get(':id')
  getAlertById(@Param('id') id: string) {
    return this.alertsService.getAlertById(id);
  }
}
