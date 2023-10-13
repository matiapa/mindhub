import { Injectable } from '@nestjs/common';
import { TextData } from './entities/text.entity';
import { TextsRepository } from './texts.repository';
import { GetTextsResDto } from './dtos/text-dto';

@Injectable()
export class TextsService {
  constructor(private readonly textsRepo: TextsRepository) {}

  async create(text: TextData): Promise<void> {
    return this.textsRepo.create(text);
  }

  async createMany(texts: TextData[]): Promise<void> {
    return this.textsRepo.createMany(texts);
  }

  async getUserTexts(userId: string): Promise<GetTextsResDto> {
    return {
      texts: await this.textsRepo.getByUser(userId),
    };
  }

  async remove(userId: string, date: string): Promise<void> {
    return this.textsRepo.remove(userId, date);
  }
}
