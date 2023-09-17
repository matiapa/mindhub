import { Injectable } from '@nestjs/common';
import { User, UserModel } from './entities/user.entity';

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

  remove(id: string): Promise<void> {
    return UserModel.delete(id);
  }
}
