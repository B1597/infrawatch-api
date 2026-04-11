import { Injectable, NotFoundException } from '@nestjs/common';
import topologyRaw from './data/topology.json';
import nodeDetailsRaw from './data/node-details.json';
import nodeMetricsRaw from './data/node-metrics.json';
import nodeConfigRaw from './data/node-config.json';
import { RawTopologyItem } from './interfaces/topology-item.interface';
import { DatacenterDto } from './dto/datacenter.dto';
import { DeviceDto } from './dto/device.dto';
import { RackDto } from './dto/rack.dto';
import { NodeDetailsDto } from './dto/node-details.dto';
import { NodeMetricsDto } from './dto/node-metrics.dto';
import { NodeConfigDto, UpdateNodeConfigDto } from './dto/node-config.dto';
import { NodeType } from './types/node-type.enum';


@Injectable()
export class TopologyService {
  private readonly topologyRaw: RawTopologyItem[] = topologyRaw as RawTopologyItem[];

  getDatacenters(): DatacenterDto[] {
    return this.topologyRaw
      .filter((item) => item.type === 'datacenter')
      .map((item) => ({
        id: item.id,
        name: item.label,
        type: 'datacenter',
        status: item.status ?? 'unknown',
        location: item.location ?? '',
      }));
  }

  getRacks(datacenterId: string): RackDto[] {
    const datacenter = this.topologyRaw.find(
      (item) => item.type === 'datacenter' && item.id === datacenterId,
    );
    if (!datacenter) throw new NotFoundException(`Datacenter ${datacenterId} not found`);

    return this.topologyRaw
      .filter((item) => item.type === 'rack' && item.parent === datacenterId)
      .map((item) => ({
        id: item.id,
        name: item.label,
        type: 'rack',
        status: item.status ?? 'unknown',
        location: item.meta?.floor ? `Floor ${item.meta.floor}` : '',
        parentId: item.parent ?? '',
      }));
  }

  getDevices(rackId: string): DeviceDto[] {
    const rack = this.topologyRaw.find(
      (item) => item.type === 'rack' && item.id === rackId,
    );
    if (!rack) throw new NotFoundException(`Rack ${rackId} not found`);

    return this.topologyRaw
      .filter(
        (item) =>
          ['server', 'switch', 'router', 'storage', 'vm', 'service'].includes(item.type) &&
          item.parent === rackId,
      )
      .map((item) => ({
        id: item.id,
        name: item.label,
        type: item.type as DeviceDto['type'],
        status: item.state ?? item.status ?? 'unknown',
        ipAddress: item.ip ?? '',
        parentId: item.parent ?? '',
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

  getNodeConfig(id: string): NodeConfigDto {
    const details = (nodeDetailsRaw as NodeDetailsDto[]).find((item) => item.id === id);
    if (!details) throw new NotFoundException(`Node ${id} not found`);

    const config = (nodeConfigRaw as any[]).find((item) => item.id === id);

    return {
      id: details.id,
      type: details.type,
      name: details.name,
      ...(details.location !== undefined && { location: details.location }),
      ...(details.ipAddress !== undefined && { ipAddress: details.ipAddress }),
      ...(config?.password !== undefined && { password: config.password }),
      ...(config?.registrationId !== undefined && { registrationId: config.registrationId }),
      ...(config?.macAddress !== undefined && { macAddress: config.macAddress }),
    };
  }

  checkNameExists(
    name: string,
    parentId?: string,
    currentId?: string,
  ): { exists: boolean } {
    const normalizedName = name.trim().toLowerCase();
    const normalizedParentId = parentId?.trim() || null;
    const normalizedCurrentId = currentId?.trim() || null;
    const exists = this.topologyRaw.some(
      (item) =>
        (item.parent ?? null) === normalizedParentId &&
        item.id !== normalizedCurrentId &&
        item.label.trim().toLowerCase() === normalizedName,
    );
    return { exists };
  }

  getNodePath(id: string): string[] {
    const node = this.topologyRaw.find((item) => item.id === id);
    if (!node) throw new NotFoundException(`Node ${id} not found`);

    const path: string[] = [];
    let current = node;

    while (current.parent) {
      const parent = this.topologyRaw.find((item) => item.id === current.parent);
      if (!parent) break;
      path.unshift(parent.id);
      current = parent;
    }

    return path;
  }

  updateNodeConfig(id: string, dto: UpdateNodeConfigDto): NodeConfigDto {
    const details = (nodeDetailsRaw as NodeDetailsDto[]).find((item) => item.id === id);
    if (!details) throw new NotFoundException(`Node ${id} not found`);

    const config = (nodeConfigRaw as any[]).find((item) => item.id === id);
    if (!config) throw new NotFoundException(`Config for node ${id} not found`);

    return { ...this.getNodeConfig(id), ...dto };
  }

}
