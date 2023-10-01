import { ProviderEnum } from '@Feature/providers';
import { Artist, Resource, Track } from '../entities';
import { ResourceType } from '../enums';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ResourceDto implements Resource {
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @IsEnum(ProviderEnum)
  @IsNotEmpty()
  provider: ProviderEnum;

  @IsEnum(ResourceType)
  @IsNotEmpty()
  type: ResourceType;

  @IsNotEmpty()
  data: Track | Artist;
}
