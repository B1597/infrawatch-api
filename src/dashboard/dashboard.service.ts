import { Injectable } from '@nestjs/common';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { DashboardHealthDto } from './dto/dashboard-health.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<DashboardStatsDto> {
    const totalNodes = await this.prisma.db.node.count();
    const online = await this.prisma.db.node.count({
      where: { status: 'online' },
    });
    const warnings = await this.prisma.db.node.count({
      where: { status: 'warning' },
    });
    const offline = await this.prisma.db.node.count({
      where: { status: 'offline' },
    });
    const datacenters = await this.prisma.db.node.count({
      where: { type: 'datacenter' },
    });
    const racks = await this.prisma.db.node.count({ where: { type: 'rack' } });
    const servers = await this.prisma.db.node.count({
      where: { type: 'server' },
    });
    const vms = await this.prisma.db.node.count({ where: { type: 'vm' } });
    const services = await this.prisma.db.node.count({
      where: { type: 'service' },
    });

    return {
      totalNodes,
      online,
      warnings,
      offline,
      datacenters,
      racks,
      servers,
      vms,
      services,
      trends: {
        totalNodes: { change: 5, direction: 'up' },
        warnings: { change: -2, direction: 'down' },
      },
    };
  }

  async getHealth(): Promise<DashboardHealthDto> {
    const result = await this.prisma.db.node.aggregate({
      _avg: {
        cpuUsage: true,
        memoryUsage: true,
        networkUsage: true,
        storageUsage: true,
      },
    });

    return {
      cpu: Math.round(result._avg.cpuUsage ?? 0),
      memory: Math.round(result._avg.memoryUsage ?? 0),
      network: Math.round(result._avg.networkUsage ?? 0),
      storage: Math.round(result._avg.storageUsage ?? 0),
    };
  }
}
