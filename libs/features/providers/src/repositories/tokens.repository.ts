import { Injectable } from '@nestjs/common';
import { Token, TokenItem, tokenModelFactory } from '../entities/tokens.entity';
import { ProviderEnum } from '../enums/providers.enum';
import { ModelType } from 'dynamoose/dist/General';
import { ConfigService } from '@nestjs/config';
import { ProvidersConfig } from '../providers.config';

@Injectable()
export class TokensRepository {
  private model: ModelType<TokenItem>;

  constructor(configService: ConfigService) {
    const config = configService.get<ProvidersConfig>('providers')!;
    this.model = tokenModelFactory(config.api.tokensTableName);
  }

  create(token: Partial<Token>): Promise<Token> {
    return this.model.create(token);
  }

  update(
    userId: string,
    service: ProviderEnum,
    token: Partial<Token>,
  ): Promise<Token> {
    return this.model.update({ userId, service }, token);
  }

  getOne(userId: string, service: ProviderEnum): Promise<Token> {
    return this.model.get({ userId, service });
  }

  remove(userId: string, service: ProviderEnum): Promise<void> {
    return this.model.delete({ userId, service });
  }
}
