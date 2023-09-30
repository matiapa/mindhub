import { ProviderEnum } from '@Feature/providers';
import { Artist, Resource, Track } from '../entities';
import { ResourceTypeEnum } from '../enums';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ResourceDto implements Resource {
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @IsEnum(ProviderEnum)
  @IsNotEmpty()
  provider: ProviderEnum;

  @IsEnum(ResourceTypeEnum)
  @IsNotEmpty()
  type: ResourceTypeEnum;

  @IsNotEmpty()
  data: Track | Artist;
}
