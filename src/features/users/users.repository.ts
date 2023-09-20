import { Injectable } from '@nestjs/common';
import { User, UserModel } from './entities';

@Injectable()
export class UsersRepository {
  create(user: Partial<User>): Promise<User> {
    return UserModel.create(user);
  }

  update(user: Partial<User>): Promise<User> {
    return UserModel.update(user);
  }

  async getAll(): Promise<User[]> {
    const res = await UserModel.scan().exec();
    return [...res.values()];
  }

  getById(id: string): Promise<User> {
    return UserModel.get(id);
  }

  async getManyByIds(ids: string[]): Promise<User[]> {
    const res = await UserModel.batchGet(ids);
    return [...res.values()];
  }

  remove(id: string): Promise<void> {
    return UserModel.delete(id);
  }
}
