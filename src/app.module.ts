import { Module } from '@nestjs/common';
import { TopologyModule } from './topology/topology.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AlertsModule } from './alerts/alerts.module';

@Module({
  imports: [TopologyModule, DashboardModule, AlertsModule],
})
export class AppModule {}
