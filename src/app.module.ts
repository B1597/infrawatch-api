import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TopologyModule } from './topology/topology.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AlertsModule } from './alerts/alerts.module';

@Module({
  imports: [PrismaModule, TopologyModule, DashboardModule, AlertsModule],
})
export class AppModule {}
