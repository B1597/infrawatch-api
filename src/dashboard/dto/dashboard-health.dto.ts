import { ApiProperty } from '@nestjs/swagger';

export class DashboardHealthDto {
  @ApiProperty()
  cpu!: number;

  @ApiProperty()
  memory!: number;

  @ApiProperty()
  network!: number;

  @ApiProperty()
  storage!: number;
}
