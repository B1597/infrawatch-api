import { ApiProperty } from '@nestjs/swagger';

export class AlertDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  severity!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  source!: string;

  @ApiProperty()
  deviceType!: string;

  @ApiProperty()
  category!: string;

  @ApiProperty()
  timestamp!: Date;

  @ApiProperty({ required: false, nullable: true })
  acknowledgedBy?: string | null;
}
