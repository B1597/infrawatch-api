import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchNodesDto {
  @ApiProperty({ description: 'Search query string' })
  @IsString()
  @IsNotEmpty()
  q!: string;
}
