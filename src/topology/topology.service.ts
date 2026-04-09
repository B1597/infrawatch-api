import { Injectable, NotFoundException } from '@nestjs/common';
import topologyRaw from './data/topology.json';
import nodeDetailsRaw from './data/node-details.json';
import { RawTopologyItem } from './interfaces/topology-item.interface';
import { DatacenterDto } from './dto/datacenter.dto';
import { DeviceDto } from './dto/device.dto';
import { RackDto } from './dto/rack.dto';
import { NodeDetailsDto } from './dto/node-details.dto';


@Injectable()
export class TopologyService {
  private readonly topologyRaw: RawTopologyItem[] = topologyRaw as RawTopologyItem[];

  getDatacenters(): DatacenterDto[] {
    return this.topologyRaw
      .filter((item) => item.kind === 'datacenter')
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
      (item) => item.kind === 'datacenter' && item.id === datacenterId,
    );
    if (!datacenter) throw new NotFoundException(`Datacenter ${datacenterId} not found`);

    return this.topologyRaw
      .filter((item) => item.kind === 'rack' && item.parent === datacenterId)
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
      (item) => item.kind === 'rack' && item.id === rackId,
    );
    if (!rack) throw new NotFoundException(`Rack ${rackId} not found`);

    return this.topologyRaw
      .filter(
        (item) =>
          ['server', 'switch', 'router', 'storage'].includes(item.kind) &&
          item.parent === rackId,
      )
      .map((item) => ({
        id: item.id,
        name: item.label,
        type: item.kind as DeviceDto['type'],
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

}
