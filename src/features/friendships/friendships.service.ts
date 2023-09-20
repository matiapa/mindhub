import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendshipStatus } from './entities';
import { FriendshipType } from './dtos';
import { FriendshipsRepository } from './friendships.repository';
import { UsersService, UserInfo, UserInfoConfig } from 'src/features/users';
import { getAuthenticadedUserId } from 'src/utils';
import { MailingService } from 'src/providers/mailing/mailing.service';

@Injectable()
export class FriendshipsService {
  constructor(
    private readonly friendshipsRepo: FriendshipsRepository,
    private readonly usersService: UsersService,
    private readonly mailingService: MailingService,
  ) {}

  async proposeFriendship(target: string): Promise<void> {
    const authenticatedUserId = getAuthenticadedUserId();

    // Check that target is not the same as proposer

    if (target === authenticatedUserId)
      throw new BadRequestException('Friendship target can be the proposer');

    // Check that target user exists

    const targetUser = await this.usersService.getUser(target);
    if (!targetUser)
      throw new BadRequestException('Friendship target does not exist');

    // Check that the request was not already sent

    const sentReq = await this.friendshipsRepo.getOne(
      authenticatedUserId,
      target,
    );
    if (sentReq) {
      if (sentReq.status === FriendshipStatus.ACCEPTED) {
        throw new BadRequestException('The users are already friends');
      } else {
        throw new BadRequestException(
          'A friendship request to this user has already been sent',
        );
      }
    }

    // Check that there are no pending requests from the target

    const receivedReq = await this.friendshipsRepo.getOne(
      target,
      authenticatedUserId,
    );
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
      proposer: authenticatedUserId,
      target,
      status: FriendshipStatus.PENDING,
    });

    // Notify the target about the friendship request

    const authenticatedUser =
      await this.usersService.getUser(authenticatedUserId);

    await this.mailingService.sendEmail({
      source: process.env.FRIENDSHIP_REQUESTS_SENDER_EMAIL!,
      destination: {
        toAddresses: [targetUser.email],
      },
      subject: 'New friendship request',
      body: {
        html: `<p>You have received a friendship request from ${authenticatedUser?.profile.name}</p>`,
      },
    });
  }

  async getFriendships(
    type: FriendshipType,
    userInfoConfig: UserInfoConfig,
  ): Promise<UserInfo[]> {
    const authUserId = getAuthenticadedUserId();

    let counterpartiesIds: string[];

    if (type === FriendshipType.PROPOSED) {
      const proposed = await this.friendshipsRepo.getByProposer(
        authUserId,
        FriendshipStatus.PENDING,
      );

      counterpartiesIds = proposed.map((fs) => fs.target);
    } else if (type === FriendshipType.RECEIVED) {
      const received = await this.friendshipsRepo.getByTarget(
        authUserId,
        FriendshipStatus.PENDING,
      );

      counterpartiesIds = received.map((fs) => fs.proposer);
    } else {
      // We must get accepted friendships independently of the side

      const proposed = await this.friendshipsRepo.getByProposer(
        authUserId,
        FriendshipStatus.ACCEPTED,
      );
      counterpartiesIds = proposed.map((fs) => fs.target);

      const received = await this.friendshipsRepo.getByTarget(
        authUserId,
        FriendshipStatus.ACCEPTED,
      );

      counterpartiesIds = [
        ...counterpartiesIds,
        ...received.map((fs) => fs.proposer),
      ];
    }

    // Map the list of IDs to actual UserInfo objects

    return this.usersService.getManyUsersInfo(
      counterpartiesIds,
      userInfoConfig,
    );
  }

  async reviewRequest(proposerId: string, accept: boolean): Promise<void> {
    const authenticatedUser = getAuthenticadedUserId();

    const friendship = await this.friendshipsRepo.getOne(
      proposerId,
      authenticatedUser,
    );
    if (!friendship)
      throw new NotFoundException(
        `No friendship requests from ${proposerId} where found`,
      );

    if (friendship.status != FriendshipStatus.PENDING)
      throw new BadRequestException(
        `This request has already been accepted or rejected`,
      );

    await this.friendshipsRepo.update(proposerId, authenticatedUser, {
      status: accept ? FriendshipStatus.ACCEPTED : FriendshipStatus.REJECTED,
    });
  }
}
