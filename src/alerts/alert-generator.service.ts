/**
 * IMPORTANT!
 * Simulates real-time alert generation for demo purposes.
 * In production, alerts would be event-driven, pushed by device agents
 * the moment a threshold is breached.
 *
 * Here we poll the Node table every 30s. To avoid flooding the system with
 * alerts all at once, each cycle picks one random violating node per metric
 * category (CPU, memory, storage, network) rather than alerting on every
 * violation immediately. Deduplication ensures no duplicate active alerts
 * exist for the same node and category.
 */
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../prisma/prisma.service';

const THRESHOLDS = [
  {
    metric: 'cpuUsage' as const,
    critical: 90,
    warning: 85,
    category: 'performance',
    title: (level: string) =>
      `High CPU Usage${level === 'critical' ? ' — Critical' : ''}`,
    message: (value: number) =>
      `CPU usage is at ${value}% — sustained high load detected.`,
  },
  {
    metric: 'memoryUsage' as const,
    critical: 90,
    warning: 85,
    category: 'performance',
    title: (level: string) =>
      `Memory Pressure${level === 'critical' ? ' — Critical' : ' Detected'}`,
    message: (value: number) =>
      `Memory utilization reached ${value}% — available memory is low.`,
  },
  {
    metric: 'storageUsage' as const,
    critical: 95,
    warning: 92,
    category: 'storage',
    title: (level: string) =>
      `${level === 'critical' ? 'Disk Space Critical' : 'Disk Space Warning'}`,
    message: (value: number) =>
      `Storage utilization at ${value}% — capacity threshold exceeded.`,
  },
  {
    metric: 'networkUsage' as const,
    critical: 90,
    warning: 85,
    category: 'network',
    title: (level: string) =>
      `High Network Utilization${level === 'critical' ? ' — Critical' : ''}`,
    message: (value: number) =>
      `Network usage at ${value}% — interface approaching saturation.`,
  },
];

const EXCLUDED_TYPES = ['datacenter', 'rack'];

@Injectable()
export class AlertGeneratorService implements OnModuleInit, OnModuleDestroy {
  private intervalId?: NodeJS.Timeout;

  constructor(
    private readonly alertsService: AlertsService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.intervalId = setInterval(() => void this.scanAndAlert(), 30_000);
  }

  onModuleDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private async scanAndAlert(): Promise<void> {
    const nodes = await this.prisma.db.node.findMany({
      where: {
        type: { notIn: EXCLUDED_TYPES },
        OR: [
          { cpuUsage: { not: null } },
          { memoryUsage: { not: null } },
          { storageUsage: { not: null } },
          { networkUsage: { not: null } },
        ],
      },
      select: {
        id: true,
        name: true,
        type: true,
        cpuUsage: true,
        memoryUsage: true,
        storageUsage: true,
        networkUsage: true,
      },
    });

    const shuffled = nodes.sort(() => Math.random() - 0.5);

    for (const threshold of THRESHOLDS) {
      const candidate = shuffled.find((node) => {
        const value = node[threshold.metric];
        return (
          value !== null && value !== undefined && value >= threshold.warning
        );
      });

      if (!candidate) continue;

      const value = candidate[threshold.metric]!;
      const level = value >= threshold.critical ? 'critical' : 'warning';

      const alreadyActive = await this.prisma.db.alert.findFirst({
        where: {
          nodeId: candidate.id,
          category: threshold.category,
          status: { in: ['active', 'acknowledged'] },
        },
      });

      if (alreadyActive) continue;

      await this.alertsService.createAlert({
        title: threshold.title(level),
        message: threshold.message(value),
        severity: level,
        category: threshold.category,
        deviceType: candidate.type,
        source: candidate.name,
        nodeId: candidate.id,
        timestamp: new Date(),
      });
    }
  }
}
