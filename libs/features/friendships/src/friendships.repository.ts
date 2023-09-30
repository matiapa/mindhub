import { Injectable } from '@nestjs/common';
import {
  Friendship,
  FriendshipItem,
  FriendshipStatus,
  friendshipModelFactory,
} from './entities';
import { FriendshipsConfig } from './friendships.config';
import { ModelType } from 'dynamoose/dist/General';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FriendshipsRepository {
  private model: ModelType<FriendshipItem>;

  constructor(configService: ConfigService) {
    const config = configService.get<FriendshipsConfig>('friendships')!;
    this.model = friendshipModelFactory(config.friendshipsTableName);
  }

  create(friendship: Friendship): Promise<Friendship> {
    return this.model.create(friendship);
  }

  update(
    proposerId: string,
    targetId: string,
    friendship: Partial<Friendship>,
  ): Promise<Friendship> {
    return this.model.update(
      { proposer: proposerId, target: targetId },
      friendship,
    );
  }

  getOne(proposerId: string, targetId: string): Promise<Friendship> {
    return this.model.get({ proposer: proposerId, target: targetId });
  }

  async getByProposer(
    proposerId: string,
    status?: FriendshipStatus,
  ): Promise<Friendship[]> {
    let query = this.model.query({ proposer: proposerId });
    if (status) {
      query = query.filter('status').eq(status);
    }
    const res = await query.exec();
    return [...res.values()];
  }

  async getByTarget(
    targetId: string,
    status?: FriendshipStatus,
  ): Promise<Friendship[]> {
    let query = this.model.query({ target: targetId }).using('InvertedIndex');
    if (status) {
      query = query.filter('status').eq(status);
    }
    const res = await query.exec();
    return [...res.values()];
  }

  remove(proposerId: string, targetId: string): Promise<void> {
    return this.model.delete({ proposer: proposerId, target: targetId });
  }
}
