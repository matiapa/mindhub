import { Injectable } from '@nestjs/common';
import { Token, TokenModel } from './tokens.entity';
import { ResourceProviderEnum } from '../resources/enums';

@Injectable()
export class TokensRepository {
  create(token: Partial<Token>): Promise<Token> {
    return TokenModel.create(token);
  }

  update(
    userId: string,
    service: ResourceProviderEnum,
    token: Partial<Token>,
  ): Promise<Token> {
    return TokenModel.update({ userId, service }, token);
  }

  getOne(userId: string, service: ResourceProviderEnum): Promise<Token> {
    return TokenModel.get({ userId, service });
  }

  remove(userId: string, service: ResourceProviderEnum): Promise<void> {
    return TokenModel.delete({ userId, service });
  }
}
