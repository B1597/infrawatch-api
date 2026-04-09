import { Module } from '@nestjs/common';
import { TopologyModule } from './topology/topology.module';

@Module({
  imports: [TopologyModule],
})
export class AppModule {}
