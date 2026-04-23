import { ApiProperty } from '@nestjs/swagger';

export class CreateAlertDto {
  @ApiProperty()
  title!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  severity!: string;

  @ApiProperty()
  source!: string;

  @ApiProperty()
  deviceType!: string;

  @ApiProperty()
  category!: string;

  @ApiProperty()
  timestamp!: Date;

  @ApiProperty({ required: false, nullable: true })
  nodeId?: string | null;
}
