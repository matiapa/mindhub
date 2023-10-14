import { Injectable } from '@nestjs/common';
import { Text } from './entities/text.entity';
import { TextsRepository } from './texts.repository';
import {
  GetUserTextsReqDto,
  GetUserTextsResDto,
} from './dtos/get-user-texts.dto';

@Injectable()
export class TextsService {
  constructor(private readonly textsRepo: TextsRepository) {}

  async upsertMany(texts: Text[]): Promise<void> {
    return this.textsRepo.upsertMany(texts);
  }

  async getUserTexts(
    dto: GetUserTextsReqDto,
    userId: string,
  ): Promise<GetUserTextsResDto> {
    const texts = await this.textsRepo.getPaginated(
      {
        offset: dto.offset,
        limit: dto.limit,
        sortBy: 'date',
        sortOrder: 'desc',
      },
      { userId },
    );

    return {
      texts: texts.map((t) => ({
        _id: t._id,
        provider: t.provider,
        rawText: t.rawText,
        language: t.language,
        date: t.date,
      })),
      count: texts.length,
      total: await this.textsRepo.count({ userId }),
    };
  }

  async remove(_id: string, userId: string): Promise<void> {
    await this.textsRepo.remove({ _id, userId });
  }
}
