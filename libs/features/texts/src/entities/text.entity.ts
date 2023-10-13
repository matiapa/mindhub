import { ProviderEnum } from '@Feature/providers';
import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

export interface ITextData {
  ownerId: string;
  provider: ProviderEnum;
  rawText: string;
  language: string; // ISO 639-1 code
  date?: string;
}

export class TextData implements ITextData {
  @IsString()
  @IsNotEmpty()
  ownerId: string;

  @IsEnum(ProviderEnum)
  @IsNotEmpty()
  provider: ProviderEnum;

  @IsString()
  @IsNotEmpty()
  rawText: string;

  @IsString()
  @IsNotEmpty()
  language: string; // ISO 639-1 code

  @IsDateString()
  @IsNotEmpty()
  date?: string;
}
export class TextItem extends Item implements ITextData {
  ownerId: string;
  provider: ProviderEnum;
  rawText: string;
  language: string; // ISO 639-1 code
  date?: string;
}

const TextSchema = new dynamoose.Schema(
  {
    ownerId: {
      type: String,
      hashKey: true,
    },
    provider: String,
    rawText: String,
    language: String,
    date: {
      type: String,
      rangeKey: true,
    },
  },
  {
    timestamps: true,
  },
);

export const textModelFactory = (tableName) =>
  dynamoose.model<TextItem>('Text', TextSchema, {
    tableName,
    create: false,
    waitForActive: false,
  });
