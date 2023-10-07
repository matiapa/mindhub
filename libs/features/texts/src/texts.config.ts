import { IsNotEmpty, IsString } from 'class-validator';

export class TextsConfig {
  @IsString()
  @IsNotEmpty()
  textsTableName: string = process.env.TEXTS_TABLE_NAME!;
}
