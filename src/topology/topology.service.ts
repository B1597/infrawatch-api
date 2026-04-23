import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DatacenterDto } from './dto/datacenter.dto';
import { DeviceDto } from './dto/device.dto';
import { RackDto } from './dto/rack.dto';
import { NodeDetailsDto } from './dto/node-details.dto';
import { NodeMetricsDto } from './dto/node-metrics.dto';
import { NodeConfigDto, UpdateNodeConfigDto } from './dto/node-config.dto';
import { NodePathDto, SearchResultDto } from './dto/search-result.dto';

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
    if (!datacenter)
      throw new NotFoundException(`Datacenter ${datacenterId} not found`);

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
        type: {
          in: ['server', 'switch', 'router', 'storage', 'vm', 'service'],
        },
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

  async getNodeDetails(id: string): Promise<NodeDetailsDto> {
    const node = await this.prisma.db.node.findUnique({ where: { id } });
    if (!node) throw new NotFoundException(`Node ${id} not found`);

    return {
      id: node.id,
      name: node.name,
      type: node.type,
      status: node.status,
      parentId: node.parentId ?? undefined,
      location: node.location ?? node.floor ?? undefined,
      ipAddress: node.ipAddress ?? undefined,
      vendor: node.vendor ?? '',
      serialNumber: node.serialNumber ?? '',
      hardware: {
        cpuCores: node.cpuCores ?? 0,
        memory: node.memoryCapacity ?? '',
        storage: node.storageCapacity ?? '',
        firmware: node.firmware ?? '',
      },
      stats: {
        cpuUsage: node.cpuUsage ?? 0,
        memoryUsage: node.memoryUsage ?? 0,
        storageUsage: node.storageUsage ?? 0,
        networkIO: node.networkIO ?? '',
        networkOut: node.networkOut ?? '',
        uptimeDays: node.uptimeDays ?? 0,
        availability: node.availability ?? '',
      },
    };
  }

  async getNodeMetrics(id: string): Promise<NodeMetricsDto> {
    const metrics = await this.prisma.db.nodeMetrics.findUnique({
      where: { nodeId: id },
    });
    if (!metrics)
      throw new NotFoundException(`Metrics for node ${id} not found`);
    return metrics.data as unknown as NodeMetricsDto;
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
      location: node.location ?? undefined,
      ipAddress: node.ipAddress ?? undefined,
      password: node.config?.password ?? undefined,
      registrationId: node.config?.registrationId ?? undefined,
      macAddress: node.config?.macAddress ?? undefined,
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

  async getNodePath(id: string): Promise<NodePathDto[]> {
    const node = await this.prisma.db.node.findUnique({ where: { id } });
    if (!node) throw new NotFoundException(`Node ${id} not found`);

    const path: NodePathDto[] = [];
    let current = node;

    while (current.parentId) {
      const parent = await this.prisma.db.node.findUnique({
        where: { id: current.parentId },
      });
      if (!parent) break;
      path.unshift({ id: parent.id, name: parent.name, type: parent.type });
      current = parent;
    }

    return path;
  }

  async searchNodes(q: string): Promise<SearchResultDto[]> {
    const matches = await this.prisma.db.node.findMany({
      where: { name: { contains: q.trim(), mode: 'insensitive' } },
    });

    return Promise.all(
      matches.map(async (node) => ({
        id: node.id,
        name: node.name,
        type: node.type,
        status: node.status,
        parentId: node.parentId ?? undefined,
        path: await this.getNodePath(node.id),
      })),
    );
  }

  async updateNodeConfig(
    id: string,
    dto: UpdateNodeConfigDto,
  ): Promise<NodeConfigDto> {
    const nodeData = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.location !== undefined && { location: dto.location }),
      ...(dto.ipAddress !== undefined && { ipAddress: dto.ipAddress }),
    };

    const configData = {
      ...(dto.password !== undefined && { password: dto.password }),
      ...(dto.registrationId !== undefined && {
        registrationId: dto.registrationId,
      }),
    };

    const node = await this.prisma.db.node.update({
      where: { id },
      data: {
        ...nodeData,
        ...(Object.keys(configData).length > 0 && {
          config: {
            upsert: {
              update: configData,
              create: configData,
            },
          },
        }),
      },
      include: { config: true },
    });

    return {
      id: node.id,
      type: node.type,
      name: node.name,
      location: node.location ?? undefined,
      ipAddress: node.ipAddress ?? undefined,
      password: node.config?.password ?? undefined,
      registrationId: node.config?.registrationId ?? undefined,
    };
  }

  async deleteNode(id: string): Promise<void> {
    const node = await this.prisma.db.node.findUnique({
      where: { id },
      select: { id: true, type: true },
    });

    if (!node) {
      throw new NotFoundException(`Node ${id} not found`);
    }
    if (node.type === 'datacenter') {
      throw new BadRequestException('Datacenters cannot be deleted');
    }

    await this.prisma.db.node.delete({ where: { id } });
  }
}
