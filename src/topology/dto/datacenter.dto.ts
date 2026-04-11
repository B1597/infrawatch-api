import { ApiProperty } from '@nestjs/swagger';

export class DatacenterDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ example: 'datacenter' })
  type!: 'datacenter';

  @ApiProperty()
  status!: string;

  @ApiProperty()
  location!: string;
}
