import { Injectable, NotFoundException } from '@nestjs/common';
import nodeDetailsRaw from './data/node-details.json';
import nodeMetricsRaw from './data/node-metrics.json';
import { PrismaService } from '../prisma/prisma.service';
import { DatacenterDto } from './dto/datacenter.dto';
import { DeviceDto } from './dto/device.dto';
import { RackDto } from './dto/rack.dto';
import { NodeDetailsDto } from './dto/node-details.dto';
import { NodeMetricsDto } from './dto/node-metrics.dto';
import { NodeConfigDto, UpdateNodeConfigDto } from './dto/node-config.dto';

@Injectable()
export class TopologyService {
  constructor(private readonly prisma: PrismaService) {}

  async getDatacenters(): Promise<DatacenterDto[]> {
    const nodes = await this.prisma.db.node.findMany({
      where: { type: 'datacenter' },
    });
    return nodes.map((node) => ({
      id: node.id,
      name: node.name,
      type: 'datacenter',
      status: node.status,
      location: node.location ?? '',
    }));
  }

  async getRacks(datacenterId: string): Promise<RackDto[]> {
    const datacenter = await this.prisma.db.node.findFirst({
      where: { id: datacenterId, type: 'datacenter' },
    });
    if (!datacenter) throw new NotFoundException(`Datacenter ${datacenterId} not found`);

    const racks = await this.prisma.db.node.findMany({
      where: { type: 'rack', parentId: datacenterId },
    });
    return racks.map((node) => ({
      id: node.id,
      name: node.name,
      type: 'rack',
      status: node.status,
      location: node.floor ?? '',
      parentId: node.parentId ?? '',
    }));
  }

  async getDevices(rackId: string): Promise<DeviceDto[]> {
    const rack = await this.prisma.db.node.findFirst({
      where: { id: rackId, type: 'rack' },
    });
    if (!rack) throw new NotFoundException(`Rack ${rackId} not found`);

    const devices = await this.prisma.db.node.findMany({
      where: {
        type: { in: ['server', 'switch', 'router', 'storage', 'vm', 'service'] },
        parentId: rackId,
      },
    });
    return devices.map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type as DeviceDto['type'],
      status: node.status,
      ipAddress: node.ipAddress ?? '',
      parentId: node.parentId ?? '',
    }));
  }

  getNodeDetails(id: string): NodeDetailsDto {
    const details = (nodeDetailsRaw as NodeDetailsDto[]).find((item) => item.id === id);
    if (!details) throw new NotFoundException(`Node ${id} not found`);
    return details;
  }

  getNodeMetrics(id: string): NodeMetricsDto {
    const metrics = (nodeMetricsRaw as NodeMetricsDto[]).find((item) => item.id === id);
    if (!metrics) throw new NotFoundException(`Metrics for node ${id} not found`);
    return metrics;
  }

  async getNodeConfig(id: string): Promise<NodeConfigDto> {
    const node = await this.prisma.db.node.findUnique({
      where: { id },
      include: { config: true },
    });
    if (!node) throw new NotFoundException(`Node ${id} not found`);

    return {
      id: node.id,
      type: node.type,
      name: node.name,
      ...(node.location && { location: node.location }),
      ...(node.ipAddress && { ipAddress: node.ipAddress }),
      ...(node.config?.password && { password: node.config.password }),
      ...(node.config?.registrationId && { registrationId: node.config.registrationId }),
      ...(node.config?.macAddress && { macAddress: node.config.macAddress }),
    };
  }

  async checkNameExists(
    name: string,
    parentId?: string,
    currentId?: string,
  ): Promise<{ exists: boolean }> {
    const node = await this.prisma.db.node.findFirst({
      where: {
        name: { equals: name.trim(), mode: 'insensitive' },
        parentId: parentId?.trim() || null,
        ...(currentId && { NOT: { id: currentId.trim() } }),
      },
    });
    return { exists: !!node };
  }

  async getNodePath(id: string): Promise<string[]> {
    const node = await this.prisma.db.node.findUnique({ where: { id } });
    if (!node) throw new NotFoundException(`Node ${id} not found`);

    const path: string[] = [];
    let current = node;

    while (current.parentId) {
      const parent = await this.prisma.db.node.findUnique({
        where: { id: current.parentId },
      });
      if (!parent) break;
      path.unshift(parent.id);
      current = parent;
    }

    return path;
  }

  async updateNodeConfig(id: string, dto: UpdateNodeConfigDto): Promise<NodeConfigDto> {
    const node = await this.prisma.db.node.findUnique({ where: { id } });
    if (!node) throw new NotFoundException(`Node ${id} not found`);

    const config = await this.prisma.db.nodeConfig.findUnique({ where: { nodeId: id } });
    if (!config) throw new NotFoundException(`Config for node ${id} not found`);

    await this.prisma.db.nodeConfig.update({
      where: { nodeId: id },
      data: dto,
    });

    return this.getNodeConfig(id);
  }
}
