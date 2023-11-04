import { Injectable, Logger } from '@nestjs/common';
import { ProvidersConnRepository } from '../repositories/connection.repository';
import { GetProviderConnsResDto } from '../dtos/get-connections.dto';

@Injectable()
export class ProvidersConnService {
  private readonly logger = new Logger(ProvidersConnService.name);

  constructor(private readonly connRepo: ProvidersConnRepository) {}

  public async getConnections(userId: string): Promise<GetProviderConnsResDto> {
    const conns = await this.connRepo.getMany({ userId });

    return {
      connections: conns.map((c) => ({
        provider: c.provider,
        ...(c.oauth && { oauth: { date: c.oauth.date } }),
        ...(c.file && { file: { date: c.file.date } }),
      })),
    };
  }
}
