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

  async createAlert(dto: CreateAlertDto): Promise<AlertDto | null> {
    const canCreate = await this.evictIfAtCap();
    if (!canCreate) return null;
    const alert = await this.prisma.db.alert.create({
      data: { ...dto, status: 'active' },
    });
    if (alert.nodeId) {
      await this.syncNodeStatus(alert.nodeId);
    }
    this.gateway.emitNewAlert(alert);
    return alert;
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
    if (updated.nodeId) {
      await this.syncNodeStatus(updated.nodeId);
    }
    this.gateway.emitAlertUpdated(updated);
    return updated;
  }

  private async syncNodeStatus(nodeId: string): Promise<void> {
    await this.updateNodeStatusFromAlerts(nodeId);

    let currentId = nodeId;
    while (true) {
      const node = await this.prisma.db.node.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });
      if (!node?.parentId) break;

      await this.updateParentStatus(node.parentId);
      currentId = node.parentId;
    }
  }

  private async updateNodeStatusFromAlerts(nodeId: string): Promise<void> {
    const activeAlerts = await this.prisma.db.alert.findMany({
      where: { nodeId, status: 'active' },
      select: { severity: true },
    });

    let status = 'online';
    if (activeAlerts.some((a) => a.severity === 'critical'))
      status = 'critical';
    else if (activeAlerts.some((a) => a.severity === 'warning'))
      status = 'warning';

    await this.prisma.db.node.update({
      where: { id: nodeId },
      data: { status },
    });
  }

  private async updateParentStatus(parentId: string): Promise<void> {
    const children = await this.prisma.db.node.findMany({
      where: { parentId },
      select: { status: true },
    });

    let status = 'online';
    if (children.some((c) => c.status === 'critical')) status = 'critical';
    else if (children.some((c) => c.status === 'warning')) status = 'warning';
    else if (children.some((c) => c.status === 'offline')) status = 'offline';
    else if (children.some((c) => c.status === 'maintenance'))
      status = 'maintenance';

    await this.prisma.db.node.update({
      where: { id: parentId },
      data: { status },
    });
  }

  private async evictIfAtCap(cap = 50): Promise<boolean> {
    const count = await this.prisma.db.alert.count();
    if (count < cap) return true;

    const oldest = await this.prisma.db.alert.findFirst({
      where: { status: 'resolved' },
      orderBy: { timestamp: 'asc' },
    });

    if (!oldest) return false;

    await this.prisma.db.alert.delete({ where: { id: oldest.id } });
    return true;
  }

  private async findAlertOrThrow(id: string): Promise<AlertDto> {
    const alert = await this.prisma.db.alert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException(`Alert ${id} not found`);
    return alert;
  }
}
