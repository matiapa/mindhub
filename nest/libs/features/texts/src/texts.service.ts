import { Injectable } from '@nestjs/common';
import { Text } from './entities/text.entity';
import { TextsRepository } from './texts.repository';
import {
  GetUserTextsReqDto,
  GetUserTextsResDto,
} from './dtos/get-user-texts.dto';
import { QueueService } from '@Provider/queue';

@Injectable()
export class TextsService {
  constructor(
    private readonly textsRepo: TextsRepository,
    private readonly queueService: QueueService,
  ) {}

  async upsertMany(texts: Text[], userId: string): Promise<void> {
    await this.textsRepo.upsertMany(texts);

    await this.queueService.sendMessage(
      process.env.PERSONALITY_REQUESTS_QUEUE_URL,
      { userId },
    );
  }

  async getUserTexts(
    dto: GetUserTextsReqDto,
    userId: string,
  ): Promise<GetUserTextsResDto> {
    const filters = {
      userId,
      ...(dto.subtext && {
        rawText: { $regex: new RegExp(dto.subtext, 'i') },
      }),
    };

    const texts = await this.textsRepo.getPaginated(
      {
        offset: dto.offset,
        limit: dto.limit,
        sortBy: 'date',
        sortOrder: 'desc',
      },
      filters,
    );

    return {
      texts: texts.map((t) => ({
        _id: t['_id'],
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
