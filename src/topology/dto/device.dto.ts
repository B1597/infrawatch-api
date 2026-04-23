import { ApiProperty } from '@nestjs/swagger';

export class DeviceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({
    enum: ['server', 'switch', 'router', 'storage', 'vm', 'service'],
  })
  type!: 'server' | 'switch' | 'router' | 'storage' | 'vm' | 'service';

  @ApiProperty()
  status!: string;

  @ApiProperty()
  ipAddress!: string;

  @ApiProperty()
  parentId!: string;
}
