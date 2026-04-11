import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class NodeConfigDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty({ required: false })
  password?: string;

  @ApiProperty({ required: false })
  registrationId?: string;

  @ApiProperty({ required: false })
  ipAddress?: string;

  @ApiProperty({ required: false })
  macAddress?: string;
}

export class UpdateNodeConfigDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  registrationId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ipAddress?: string;
}
