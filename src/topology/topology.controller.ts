import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { UpdateNodeConfigDto } from './dto/node-config.dto';
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

  @Get('nodes/:id')
  getNodeDetails(@Param('id') id: string) {
    return this.topologyService.getNodeDetails(id);
  }

  @Get('nodes/:id/metrics')
  getNodeMetrics(@Param('id') id: string) {
    return this.topologyService.getNodeMetrics(id);
  }

  @Get('nodes/:id/config')
  getNodeConfig(@Param('id') id: string) {
    return this.topologyService.getNodeConfig(id);
  }

  @Put('nodes/:id/config')
  updateNodeConfig(@Param('id') id: string, @Body() dto: UpdateNodeConfigDto) {
    return this.topologyService.updateNodeConfig(id, dto);
  }
}
