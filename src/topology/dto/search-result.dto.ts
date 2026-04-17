import { ApiProperty } from '@nestjs/swagger';

export class NodePathDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  type!: string;
}

export class SearchResultDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ required: false })
  parentId?: string;

  @ApiProperty({ type: [NodePathDto] })
  path!: NodePathDto[];
}
