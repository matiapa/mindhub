import { Injectable } from '@nestjs/common';
import { User, UserItem, userModelFactory } from './entities';
import { ModelType } from 'dynamoose/dist/General';
import { ConfigService } from '@nestjs/config';
import { UsersConfig } from './users.config';

@Injectable()
export class UsersRepository {
  private model: ModelType<UserItem>;

  constructor(configService: ConfigService) {
    const config = configService.get<UsersConfig>('users')!;
    this.model = userModelFactory(config.tableName);
  }

  create(user: Partial<User>): Promise<User> {
    return this.model.create(user);
  }

  update(user: Partial<User>): Promise<User> {
    return this.model.update(user);
  }

  async getAll(): Promise<User[]> {
    const res = await this.model.scan().exec();
    return [...res.values()];
  }

  getById(id: string): Promise<User> {
    return this.model.get(id);
  }

  async getManyByIds(ids: string[]): Promise<User[]> {
    const res = await this.model.batchGet(ids);
    return [...res.values()];
  }

  remove(id: string): Promise<void> {
    return this.model.delete(id);
  }
}
