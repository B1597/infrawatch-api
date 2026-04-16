import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { AlertDto } from './dto/alert.dto';

@ApiTags('Alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOkResponse({ type: [AlertDto] })
  getAlerts() {
    return this.alertsService.getAlerts();
  }

  @Get(':id')
  @ApiOkResponse({ type: AlertDto })
  getAlertById(@Param('id') id: string) {
    return this.alertsService.getAlertById(id);
  }

  @Patch(':id/acknowledge')
  @ApiOkResponse({ type: AlertDto })
  acknowledgeAlert(@Param('id') id: string) {
    return this.alertsService.acknowledgeAlert(id);
  }

  @Patch(':id/resolve')
  @ApiOkResponse({ type: AlertDto })
  resolveAlert(@Param('id') id: string) {
    return this.alertsService.resolveAlert(id);
  }
}
