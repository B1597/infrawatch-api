import { Controller, Get, Put, Param, Body, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CheckNameDto } from './dto/check-name.dto';
import { DatacenterDto } from './dto/datacenter.dto';
import { DeviceDto } from './dto/device.dto';
import { NodeConfigDto, UpdateNodeConfigDto } from './dto/node-config.dto';
import { NodeDetailsDto } from './dto/node-details.dto';
import { NodeMetricsDto } from './dto/node-metrics.dto';
import { RackDto } from './dto/rack.dto';
import { TopologyService } from './topology.service';

@ApiTags('topology')
@Controller('topology')
export class TopologyController {
  constructor(private readonly topologyService: TopologyService) {}

  @ApiOkResponse({ type: [DatacenterDto] })
  @Get('datacenters')
  getDatacenters() {
    return this.topologyService.getDatacenters();
  }

  @ApiOkResponse({ type: [RackDto] })
  @Get('datacenters/:id/racks')
  getRacks(@Param('id') id: string) {
    return this.topologyService.getRacks(id);
  }

  @ApiOkResponse({ type: [DeviceDto] })
  @Get('racks/:id/devices')
  getDevices(@Param('id') id: string) {
    return this.topologyService.getDevices(id);
  }

  @ApiOkResponse({ schema: { properties: { exists: { type: 'boolean' } } } })
  @Get('nodes/check-name')
  checkNameExists(@Query() query: CheckNameDto) {
    return this.topologyService.checkNameExists(
      query.name,
      query.parentId,
      query.currentId,
    );
  }

  @ApiOkResponse({ type: NodeDetailsDto })
  @Get('nodes/:id')
  getNodeDetails(@Param('id') id: string) {
    return this.topologyService.getNodeDetails(id);
  }

  @ApiOkResponse({ type: NodeMetricsDto })
  @Get('nodes/:id/metrics')
  getNodeMetrics(@Param('id') id: string) {
    return this.topologyService.getNodeMetrics(id);
  }

  @ApiOkResponse({ type: NodeConfigDto })
  @Get('nodes/:id/config')
  getNodeConfig(@Param('id') id: string) {
    return this.topologyService.getNodeConfig(id);
  }

  @ApiOkResponse({ type: NodeConfigDto })
  @Put('nodes/:id/config')
  updateNodeConfig(@Param('id') id: string, @Body() dto: UpdateNodeConfigDto) {
    return this.topologyService.updateNodeConfig(id, dto);
  }
}
