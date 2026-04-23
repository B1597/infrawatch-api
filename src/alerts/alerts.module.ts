import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { AlertsGateway } from './alerts.gateway';
import { AlertGeneratorService } from './alert-generator.service';

@Module({
  controllers: [AlertsController],
  providers: [AlertsService, AlertsGateway, AlertGeneratorService],
})
export class AlertsModule {}
