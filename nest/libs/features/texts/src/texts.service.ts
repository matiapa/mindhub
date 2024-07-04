import { Injectable } from '@nestjs/common';
import { TextsRepository } from './texts.repository';
import {
  GetUserTextsReqDto,
  GetUserTextsResDto,
} from './dtos/get-user-texts.dto';
import { QueueService } from '@Provider/queue';
import { ProviderEnum } from '@Feature/providers';
import {
  CreateManualTextDto,
  CreateProviderTextDto,
} from './dtos/create-text.dto';
import { hashObjectId } from 'libs/utils';
import { Text } from './entities/text.entity';
import { ObjectId } from 'bson';

@Injectable()
export class TextsService {
  constructor(
    private readonly textsRepo: TextsRepository,
    private readonly queueService: QueueService,
  ) {}

  async upsertManual(dto: CreateManualTextDto, userId: string): Promise<Text> {
    // Hash the userId and text to create a unique textId
    // so that the same text is not inserted twice in the database
    const interestId = hashObjectId(`${userId}|${dto.rawText}`);

    const text = {
      _id: interestId,
      userId,
      provider: ProviderEnum.USER,
      rawText: dto.rawText,
      language: dto.language,
      date: new Date()
    };

    await this.textsRepo.upsertMany([text]);

    // TODO: Enable once APR handles request throttling
    // await this.queueService.sendMessage(
    //   process.env.PERSONALITY_REQUESTS_QUEUE_URL,
    //   { userId },
    // );

    return text;
  }

  async upsertProvider(
    texts: CreateProviderTextDto[],
    userId: string,
  ): Promise<void> {
    const textsWithIds = texts.map((t) => {
      // Hash the userId and text to create a unique textId
      // so that the same text is not inserted twice in the database
      const textId = hashObjectId(`${userId}|${t.rawText}`)

      return {
        _id: textId,
        userId,
        provider: t.provider,
        rawText: t.rawText,
        language: t.language,
        date: new Date(),
      };
    });

    await this.textsRepo.upsertMany(textsWithIds);

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
        _id: t['_id'].toString(),
        provider: t.provider,
        rawText: t.rawText,
        language: t.language,
        date: t.date,
      })),
      count: texts.length,
      total: await this.textsRepo.count({ userId }),
    };
  }

  async delete(_id: string, userId: string): Promise<void> {
    await this.textsRepo.deleteMany({ _id: new ObjectId(_id), userId });
  }

  async deleteByProvider(
    provider: ProviderEnum,
    userId: string,
  ): Promise<void> {
    await this.textsRepo.deleteMany({ provider, userId });
  }
}
