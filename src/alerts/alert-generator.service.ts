import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../prisma/prisma.service';

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const ALERT_TEMPLATES = [
  {
    title: 'High CPU Usage',
    message: () =>
      `CPU usage reached ${rand(91, 99)}% for more than ${rand(2, 10)} minutes.`,
    severity: 'critical',
    category: 'performance',
    deviceType: 'server',
  },
  {
    title: 'Memory Pressure Detected',
    message: () => `Available memory dropped to ${rand(2, 9)}% on this node.`,
    severity: 'warning',
    category: 'performance',
    deviceType: 'server',
  },
  {
    title: 'Network Packet Loss',
    message: () =>
      `Packet loss rate of ${rand(5, 20)}% detected on primary interface.`,
    severity: 'warning',
    category: 'network',
    deviceType: 'switch',
  },
  {
    title: 'Disk Space Critical',
    message: () =>
      `Storage utilization reached ${rand(95, 99)}% — immediate action required.`,
    severity: 'critical',
    category: 'storage',
    deviceType: 'server',
  },
  {
    title: 'Service Unreachable',
    message: () => `Health check failed ${rand(3, 6)} consecutive times.`,
    severity: 'critical',
    category: 'availability',
    deviceType: 'service',
  },
  {
    title: 'Temperature Warning',
    message: () =>
      `Chassis temperature sensor reading ${rand(76, 95)}°C — above safe operating range.`,
    severity: 'warning',
    category: 'hardware',
    deviceType: 'server',
  },
  {
    title: 'Backup Job Failed',
    message: () => `Scheduled backup failed after ${rand(5, 45)} minutes.`,
    severity: 'warning',
    category: 'operations',
    deviceType: 'vm',
  },
  {
    title: 'Unauthorized Login Attempt',
    message: () =>
      `${rand(5, 50)} failed SSH login attempts detected from external IP.`,
    severity: 'critical',
    category: 'security',
    deviceType: 'server',
  },
  {
    title: 'NTP Sync Lost',
    message: () =>
      `Node has not synced with NTP server in over ${rand(30, 120)} minutes.`,
    severity: 'info',
    category: 'operations',
    deviceType: 'server',
  },
  {
    title: 'VM Snapshot Accumulation',
    message: () =>
      `${rand(10, 25)} snapshots detected — storage performance may degrade.`,
    severity: 'info',
    category: 'storage',
    deviceType: 'vm',
  },
];

const SOURCES_BY_DEVICE_TYPE: Record<string, string[]> = {
  server: ['server-12', 'server-24', 'server-07', 'server-31'],
  vm: ['vm-45', 'vm-89'],
  switch: ['switch-core-1'],
  service: ['firewall-edge'],
};

@Injectable()
export class AlertGeneratorService implements OnModuleInit, OnModuleDestroy {
  private intervalId?: NodeJS.Timeout;

  constructor(
    private readonly alertsService: AlertsService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.intervalId = setInterval(() => void this.generateAlert(), 30_000);
  }

  onModuleDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private async generateAlert(): Promise<void> {
    const template =
      ALERT_TEMPLATES[Math.floor(Math.random() * ALERT_TEMPLATES.length)];

    const nodes = await this.prisma.db.node.findMany({
      where: { type: template.deviceType },
      select: { id: true, name: true },
    });

    const sourcePool = SOURCES_BY_DEVICE_TYPE[template.deviceType];
    const node = nodes.length
      ? nodes[Math.floor(Math.random() * nodes.length)]
      : null;

    await this.alertsService.createAlert({
      title: template.title,
      message: template.message(),
      severity: template.severity,
      category: template.category,
      deviceType: template.deviceType,
      source:
        node?.name ?? sourcePool[Math.floor(Math.random() * sourcePool.length)],
      nodeId: node?.id ?? null,
      timestamp: new Date(),
    });
  }
}
