import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ResourceType } from '../enums/resource-type.enum';

export class ResourceDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ResourceType)
  @IsNotEmpty()
  type: ResourceType;
}
