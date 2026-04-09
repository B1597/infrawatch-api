import { Controller, Get, Param } from '@nestjs/common';
import { TopologyService } from './topology.service';

@Controller('topology')
export class TopologyController {
  constructor(private readonly topologyService: TopologyService) {}

  @Get('datacenters')
  getDatacenters() {
    return this.topologyService.getDatacenters();
  }

  @Get('datacenters/:id/racks')
  getRacks(@Param('id') id: string) {
    return this.topologyService.getRacks(id);
  }

  @Get('racks/:id/devices')
  getDevices(@Param('id') id: string) {
    return this.topologyService.getDevices(id);
  }
}
