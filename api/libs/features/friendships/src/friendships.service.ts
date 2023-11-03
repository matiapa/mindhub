import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendshipStatus } from './entities';
import { FriendshipsRepository } from './friendships.repository';
import {
  SharedUserInfo,
  SharedUserInfoConfig,
  UsersService,
} from '@Feature/users';
import { MailingService } from '@Provider/mailing';
import { FriendshipType } from './dtos';
import { ConfigService } from '@nestjs/config';
import { FriendshipsConfig } from './friendships.config';

@Injectable()
export class FriendshipsService {
  private config: FriendshipsConfig;

  constructor(
    private readonly friendshipsRepo: FriendshipsRepository,
    private readonly usersService: UsersService,
    private readonly mailingService: MailingService,
    private readonly configService: ConfigService,
  ) {
    this.config = this.configService.get<FriendshipsConfig>('friendships')!;
  }

  async proposeFriendship(proposerId: string, targetId: string): Promise<void> {
    // Check that target is not the same as proposer

    if (targetId === proposerId)
      throw new BadRequestException('Friendship target can be the proposer');

    // Check that target user exists

    const targetUser = await this.usersService.getUserEntity(targetId);
    if (!targetUser)
      throw new BadRequestException('Friendship target does not exist');

    // Check that the request was not already sent

    const sentReq = await this.friendshipsRepo.getOne({
      proposer: proposerId,
      target: targetId,
    });
    if (sentReq) {
      return;
    }

    // Check that there are no pending requests from the target

    const receivedReq = await this.friendshipsRepo.getOne({
      proposer: proposerId,
      target: targetId,
    });
    if (receivedReq) {
      if (receivedReq.status === FriendshipStatus.ACCEPTED) {
        throw new BadRequestException('The users are already friends');
      } else if (receivedReq.status === FriendshipStatus.PENDING) {
        throw new BadRequestException(
          'A friendship request from this user has already been received',
        );
      }
    }

    // Create the friendship relationship on pending state

    await this.friendshipsRepo.create({
      proposer: proposerId,
      target: targetId,
      status: FriendshipStatus.PENDING,
    });

    // Notify the target about the friendship request

    const authenticatedUser = await this.usersService.getUserEntity(proposerId);

    try {
      await this.mailingService.sendEmail({
        source: this.config.friendshipRequestsSenderEmail,
        destination: {
          toAddresses: [targetUser.email],
        },
        subject: 'New friendship request',
        body: {
          html: `<p>You have received a friendship request from ${authenticatedUser?.profile?.name}</p>`,
        },
      });
    } catch (error) {
      // TODO: Add a better handling
      console.error(error);
    }
  }

  async getFriendships(
    ofUserId: string,
    type: FriendshipType,
    populateUsers: boolean,
  ): Promise<string[]> {
    if (type === FriendshipType.PROPOSED) {
      const proposed = await this.friendshipsRepo.getMany(
        {
          proposer: ofUserId,
          status: FriendshipStatus.PENDING,
        },
        populateUsers ? ['proposer', 'target'] : undefined,
      );

      return proposed.map((fs) => fs.target);
    } else if (type === FriendshipType.RECEIVED) {
      const received = await this.friendshipsRepo.getMany(
        {
          proposer: ofUserId,
          status: FriendshipStatus.PENDING,
        },
        populateUsers ? ['proposer', 'target'] : undefined,
      );

      return received.map((fs) => fs.proposer);
    } else {
      // We must get accepted friendships independently of the side

      const proposals = await this.friendshipsRepo.getMany(
        {
          $or: [{ proposer: ofUserId }, { target: ofUserId }],
          status: FriendshipStatus.ACCEPTED,
        },
        populateUsers ? ['proposer', 'target'] : undefined,
      );

      return proposals.map((p) =>
        p.proposer === ofUserId ? p.target : p.proposer,
      );
    }
  }

  async getFriendshipsWithUserInfo(
    ofUserId: string,
    type: FriendshipType,
    userInfoConfig: SharedUserInfoConfig,
  ): Promise<SharedUserInfo[]> {
    const counterpartiesIds = await this.getFriendships(ofUserId, type, false);

    return this.usersService.getManySharedUserInfo(
      counterpartiesIds as string[],
      ofUserId,
      userInfoConfig,
    );
  }

  async reviewRequest(
    targetId: string,
    proposerId: string,
    accept: boolean,
  ): Promise<void> {
    const friendship = await this.friendshipsRepo.getOne({
      proposer: proposerId,
      target: targetId,
    });

    if (!friendship)
      throw new NotFoundException(
        `No friendship requests from ${proposerId} where found`,
      );

    if (friendship.status != FriendshipStatus.PENDING)
      throw new BadRequestException(
        `This request has already been accepted or rejected`,
      );

    await this.friendshipsRepo.updateOne(
      {
        proposer: proposerId,
        target: targetId,
      },
      {
        status: accept ? FriendshipStatus.ACCEPTED : FriendshipStatus.REJECTED,
      },
    );
  }
}
