import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Text } from '../entities/text.entity';
import { ProviderEnum } from '@Feature/providers';

export class CreateManualTextDto implements Pick<Text, 'rawText' | 'language'> {
  @IsString()
  @IsNotEmpty()
  rawText: string;

  @IsString()
  @IsNotEmpty()
  language: string; // ISO 639-1 code
}

export class CreateProviderTextDto extends CreateManualTextDto {
  @IsEnum(ProviderEnum)
  @IsNotEmpty()
  provider: ProviderEnum;
}
