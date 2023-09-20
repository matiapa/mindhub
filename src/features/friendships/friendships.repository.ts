import { Injectable } from '@nestjs/common';
import { Friendship, FriendshipModel, FriendshipStatus } from './entities';

@Injectable()
export class FriendshipsRepository {
  create(friendship: Partial<Friendship>): Promise<Friendship> {
    return FriendshipModel.create(friendship);
  }

  update(
    proposerId: string,
    targetId: string,
    friendship: Partial<Friendship>,
  ): Promise<Friendship> {
    return FriendshipModel.update(
      { proposer: proposerId, target: targetId },
      friendship,
    );
  }

  getOne(proposerId: string, targetId: string): Promise<Friendship> {
    return FriendshipModel.get({ proposer: proposerId, target: targetId });
  }

  async getByProposer(
    proposerId: string,
    status?: FriendshipStatus,
  ): Promise<Friendship[]> {
    let query = FriendshipModel.query({ proposer: proposerId });
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
    let query = FriendshipModel.query({ target: targetId }).using(
      'InvertedIndex',
    );
    if (status) {
      query = query.filter('status').eq(status);
    }
    const res = await query.exec();
    return [...res.values()];
  }

  remove(proposerId: string, targetId: string): Promise<void> {
    return FriendshipModel.delete({ proposer: proposerId, target: targetId });
  }
}
