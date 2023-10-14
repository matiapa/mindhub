import { IsString, IsNotEmpty } from 'class-validator';
import { Text } from '../entities/text.entity';

export class CreateTextDto implements Pick<Text, 'rawText' | 'language'> {
  @IsString()
  @IsNotEmpty()
  rawText: string;

  @IsString()
  @IsNotEmpty()
  language: string; // ISO 639-1 code
}
