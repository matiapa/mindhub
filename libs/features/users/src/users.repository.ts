import { Injectable } from '@nestjs/common';
import { User, UserFilters, UserItem, userModelFactory } from './entities';
import { ModelType } from 'dynamoose/dist/General';
import { ConfigService } from '@nestjs/config';
import { UsersConfig } from './users.config';
import * as dynamoose from 'dynamoose';

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

  async getAllIds(filter?: UserFilters): Promise<string[]> {
    const condition = this.buildCondition(filter);

    const res = await this.model.scan(condition).attribute('_id').exec();

    return [...res.values()].map((u) => u._id);
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

  private buildCondition(filter?: UserFilters) {
    if (!filter) return undefined;

    let condition = new dynamoose.Condition();

    if (filter.minBirthday && filter.maxBirthday)
      condition = condition
        .where('profile.birthday')
        .between(filter.minBirthday, filter.maxBirthday);
    else if (filter.minBirthday)
      condition = condition.where('profile.birthday').ge(filter.minBirthday);
    else if (filter.maxBirthday)
      condition = condition.where('profile.birthday').le(filter.maxBirthday);

    if (filter.minLastConnectionDate)
      condition = condition
        .where('lastConnection.date')
        .ge(filter.minLastConnectionDate);

    if (filter.gender)
      condition = condition.where('profile.gender').eq(filter.gender);

    return condition;
  }
}
