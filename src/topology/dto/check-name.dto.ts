import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NodeType } from '../types/node-type.enum';

export class CheckNameDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsEnum(NodeType)
  type!: NodeType;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  currentId?: string;
}
