import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private catModel: Model<User>) {}

  async find(filter: FilterQuery<User>): Promise<User[]> {
    return this.catModel.find(filter).exec();
  }
}
