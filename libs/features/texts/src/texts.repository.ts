import { Injectable } from '@nestjs/common';
import { TextData, TextItem, textModelFactory } from './entities/text.entity';
import { ModelType } from 'dynamoose/dist/General';
import { TextsConfig } from './texts.config';
import { ConfigService } from '@nestjs/config';

const MAX_PUT_ITEMS = 25;

@Injectable()
export class TextsRepository {
  private model: ModelType<TextItem>;

  constructor(configService: ConfigService) {
    const config = configService.get<TextsConfig>('texts')!;
    this.model = textModelFactory(config.textsTableName);
  }

  async create(text: TextData): Promise<void> {
    await this.model.create(text);
  }

  async createMany(texts: TextData[]): Promise<void> {
    for (let i = 0; i < texts.length; i += MAX_PUT_ITEMS) {
      const len = Math.min(i + MAX_PUT_ITEMS, texts.length);
      const slice = texts.slice(i, len);
      await this.model.batchPut(slice);
    }
  }

  async getByUser(userId: string): Promise<TextData[]> {
    const res = await this.model.query({ userId }).exec();
    return [...res.values()];
  }

  remove(userId: string, date: string): Promise<void> {
    return this.model.delete({ userId, date });
  }
}
