import { Injectable, NotFoundException } from '@nestjs/common';
import { AlertDto } from './dto/alert.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAlerts(): Promise<AlertDto[]> {
    return this.prisma.db.alert.findMany({
      orderBy: { timestamp: 'desc' },
    });
  }

  async getAlertById(id: string): Promise<AlertDto> {
    const alert = await this.prisma.db.alert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException(`Alert ${id} not found`);
    return alert;
  }

  async acknowledgeAlert(id: string): Promise<AlertDto> {
    const alert = await this.prisma.db.alert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException(`Alert ${id} not found`);

    return this.prisma.db.alert.update({
      where: { id },
      data: {
        status: 'acknowledged',
        acknowledgedBy: 'admin',
      },
    });
  }

  async resolveAlert(id: string): Promise<AlertDto> {
    const alert = await this.prisma.db.alert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException(`Alert ${id} not found`);

    return this.prisma.db.alert.update({
      where: { id },
      data: {
        status: 'resolved',
      },
    });
  }
}
