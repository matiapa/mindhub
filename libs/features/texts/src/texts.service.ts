import { Injectable } from '@nestjs/common';
import { TextData } from './entities/text.entity';
import { TextsRepository } from './texts.repository';

@Injectable()
export class TextsService {
  constructor(private readonly textsRepo: TextsRepository) {}

  async create(text: TextData): Promise<void> {
    return this.textsRepo.create(text);
  }

  async createMany(texts: TextData[]): Promise<void> {
    return this.textsRepo.createMany(texts);
  }

  async getUserTexts(userId: string): Promise<TextData[]> {
    return this.textsRepo.getByUser(userId);
  }

  async remove(userId: string, resourceId: string): Promise<void> {
    return this.textsRepo.remove(userId, resourceId);
  }
}
