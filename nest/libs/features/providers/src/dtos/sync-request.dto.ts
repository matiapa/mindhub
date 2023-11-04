import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ProviderEnum } from '../enums/providers.enum';
import { SyncSource } from '../enums/sync-source.enum';

export class SyncRequestDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(ProviderEnum)
  @IsNotEmpty()
  provider: ProviderEnum;

  @IsString()
  @IsNotEmpty()
  requester: string;

  @IsEnum(SyncSource)
  @IsNotEmpty()
  source: SyncSource;
}
