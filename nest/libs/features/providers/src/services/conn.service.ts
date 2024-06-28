import { Injectable, Logger } from '@nestjs/common';
import { ProvidersConnRepository } from '../repositories/connection.repository';
import { GetProviderConnsResDto } from '../dtos/get-connections.dto';
import { ProviderEnum } from '../enums/providers.enum';
import { InterestsService } from '@Feature/interests';
import { TextsService } from '@Feature/texts';

@Injectable()
export class ProvidersConnService {
  private readonly logger = new Logger(ProvidersConnService.name);

  constructor(
    private readonly connRepo: ProvidersConnRepository,
    private readonly interestsService: InterestsService,
    private readonly textsService: TextsService,
  ) {}

  public async getConnections(userId: string): Promise<GetProviderConnsResDto> {
    const conns = await this.connRepo.getMany({ userId });

    return {
      connections: conns.map((c) => ({
        provider: c.provider,
        ...(c.oauth && { oauth: { date: c.oauth.date } }),
        ...(c.file && { file: { date: c.file.date } }),
        ...(c.lastProcessed && { lastProcessed: c.lastProcessed }),
      })),
    };
  }

  public async deleteConnection(provider: ProviderEnum, userId: string) {
    const res = await this.connRepo.deleteOne({ userId, provider });

    if (res.deletedCount > 0) {
      await this.interestsService.deleteByProvider(provider, userId);

      await this.textsService.deleteByProvider(provider, userId);
    }
  }
}
