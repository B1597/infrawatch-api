import { ApiProperty } from '@nestjs/swagger';

export class RackDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ example: 'rack' })
  type!: 'rack';

  @ApiProperty()
  status!: string;

  @ApiProperty()
  location!: string;

  @ApiProperty()
  parentId!: string;
}
