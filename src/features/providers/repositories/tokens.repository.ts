import { Injectable } from '@nestjs/common';
import { Token, TokenModel } from '../entities/tokens.entity';
import { ProviderEnum } from '../../resources/enums';

@Injectable()
export class TokensRepository {
  create(token: Partial<Token>): Promise<Token> {
    return TokenModel.create(token);
  }

  update(
    userId: string,
    service: ProviderEnum,
    token: Partial<Token>,
  ): Promise<Token> {
    return TokenModel.update({ userId, service }, token);
  }

  getOne(userId: string, service: ProviderEnum): Promise<Token> {
    return TokenModel.get({ userId, service });
  }

  remove(userId: string, service: ProviderEnum): Promise<void> {
    return TokenModel.delete({ userId, service });
  }
}
