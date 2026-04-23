import { Injectable, NotFoundException } from '@nestjs/common';
import { AlertDto } from './dto/alert.dto';
import { CreateAlertDto } from './dto/create-alert.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AlertsGateway } from './alerts.gateway';

@Injectable()
export class AlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AlertsGateway,
  ) {}

  async getAlerts(): Promise<AlertDto[]> {
    return this.prisma.db.alert.findMany({
      orderBy: { timestamp: 'desc' },
    });
  }

  async getAlertById(id: string): Promise<AlertDto> {
    return this.findAlertOrThrow(id);
  }

  async createAlert(dto: CreateAlertDto): Promise<AlertDto> {
    await this.evictIfAtCap();
    const alert = await this.prisma.db.alert.create({
      data: { ...dto, status: 'active' },
    });
    this.gateway.emitNewAlert(alert);
    return alert;
  }

  private async evictIfAtCap(cap = 100): Promise<void> {
    const count = await this.prisma.db.alert.count();
    if (count < cap) return;

    const oldest =
      (await this.prisma.db.alert.findFirst({
        where: { status: 'resolved' },
        orderBy: { timestamp: 'asc' },
      })) ??
      (await this.prisma.db.alert.findFirst({
        orderBy: { timestamp: 'asc' },
      }));

    if (oldest) {
      await this.prisma.db.alert.delete({ where: { id: oldest.id } });
    }
  }

  async acknowledgeAlert(id: string): Promise<AlertDto> {
    await this.findAlertOrThrow(id);
    const updated = await this.prisma.db.alert.update({
      where: { id },
      data: { status: 'acknowledged', acknowledgedBy: 'admin' },
    });
    this.gateway.emitAlertUpdated(updated);
    return updated;
  }

  async resolveAlert(id: string): Promise<AlertDto> {
    await this.findAlertOrThrow(id);
    const updated = await this.prisma.db.alert.update({
      where: { id },
      data: { status: 'resolved' },
    });
    this.gateway.emitAlertUpdated(updated);
    return updated;
  }

  private async findAlertOrThrow(id: string): Promise<AlertDto> {
    const alert = await this.prisma.db.alert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException(`Alert ${id} not found`);
    return alert;
  }
}
