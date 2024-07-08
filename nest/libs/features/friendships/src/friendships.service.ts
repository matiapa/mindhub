import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendshipStatus } from './entities';
import { FriendshipsRepository } from './friendships.repository';
import { SharedUserInfoConfig, UsersService } from '@Feature/users';
import { MailingService } from '@Provider/mailing';
import { FriendshipType, GetFriendshipsResDto } from './dtos';
import { ConfigService } from '@nestjs/config';
import { FriendshipsConfig } from './friendships.config';
import { RecommendationsService } from '@Feature/recommendations';
import { NotificationsService } from '@Feature/notifications';
import { NotificationType } from '@Feature/notifications/entities/notification.entity';

@Injectable()
export class FriendshipsService {
  private config: FriendshipsConfig;

  constructor(
    private readonly friendshipsRepo: FriendshipsRepository,
    @Inject(forwardRef(() => RecommendationsService))
    private readonly recommendationService: RecommendationsService,
    private readonly usersService: UsersService,
    private readonly mailingService: MailingService,
    private readonly notificationService: NotificationsService,
    private readonly configService: ConfigService,
  ) {
    this.config = this.configService.get<FriendshipsConfig>('friendships')!;
  }

  async proposeFriendship(proposerId: string, targetId: string): Promise<void> {
    // Check that target is not the same as proposer

    if (targetId === proposerId)
      throw new BadRequestException('Friendship target can be the proposer');

    // Check that target and proposer users exists

    const targetUser = await this.usersService.getUserEntity(targetId);
    if (!targetUser)
      throw new BadRequestException('Friendship target does not exist');

    const proposerUser = await this.usersService.getUserEntity(proposerId)!;
    if (!proposerUser)
      throw new BadRequestException('Friendship proposer does not exist');

    // Check that a request from proposer to target was not already sent

    const sentReq = await this.friendshipsRepo.getOne({
      proposer: proposerId,
      target: targetId,
    });
    if (sentReq) {
      throw new BadRequestException('The proposer has already sent a request');
    }

    // Check that there are no pending requests from the target

    const receivedReq = await this.friendshipsRepo.getOne({
      proposer: targetId,
      target: proposerId,
    });
    if (receivedReq) {
      if (receivedReq.status === FriendshipStatus.ACCEPTED) {
        // If there is one accepted then there is nothing else to do
        throw new BadRequestException('The users are already friends');
      } else if (receivedReq.status === FriendshipStatus.PENDING) {
        // If ther request is pending, then we can accept it and return
        await this.reviewRequest(proposerId, targetId, true);
        return;
      }
    }

    // Create the friendship relationship on pending state

    await this.friendshipsRepo.create({
      proposer: proposerId,
      target: targetId,
      status: FriendshipStatus.PENDING,
    });

    // Notify the target about the friendship request

    try {
      await this.mailingService.sendEmail({
        source: this.config.friendshipRequestsSenderEmail,
        destination: {
          toAddresses: [targetUser.email],
        },
        subject: `${proposerUser.profile.name} te envió una solicitud de amistad`,
        body: {
          html:
            `<p>¡Hola ${targetUser.profile.name}! Recibiste una solicitud de amistad de ${proposerUser.profile.name}.</p>` +
            `<p>Para aceptarla, ingresa a tu cuenta de <a href="${this.config.frontendFriendsUrl}">MindHub</a>.</p>`,
        },
      });
    } catch (error) {
      console.error(error);
    }

    try {
      await this.notificationService.createAppNotification({
        targetUserId: targetId,
        type: NotificationType.NEW_FRIENDSHIP_REQUEST,
        payload: {
          counterpartyId: proposerId,
          counterpartyName: proposerUser?.profile?.name ?? '',
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async cancelProposal(proposerId: string, targetId: string): Promise<void> {
    await this.friendshipsRepo.remove({
      proposer: proposerId,
      target: targetId,
      status: FriendshipStatus.PENDING,
    });
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
          target: ofUserId,
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
  ): Promise<GetFriendshipsResDto> {
    const counterpartiesIds = await this.getFriendships(ofUserId, type, false);

    const users = await this.usersService.getManySharedUserInfo(
      counterpartiesIds as string[],
      ofUserId,
      userInfoConfig,
    );

    const recommendations = await Promise.all(
      counterpartiesIds.map(
        async (friendUserId) =>
          await this.recommendationService.getRecommendation(
            ofUserId,
            friendUserId,
          ),
      ),
    );

    users.sort((a, b) => a.isFake && !b.isFake ? 1 : !a.isFake && b.isFake ? -1 : 0)

    return {
      friends: counterpartiesIds.map((id, i) => ({
        user: users[i],
        score: recommendations[i]?.score,
      })),
    } as any as GetFriendshipsResDto;
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

    const targetUser = await this.usersService.getUserEntity(targetId);
    if (!targetUser)
      throw new BadRequestException('Friendship target does not exist');

    const proposerUser = await this.usersService.getUserEntity(proposerId);
    if (!proposerUser)
      throw new BadRequestException('Friendship proposer does not exist');
  
    await this.friendshipsRepo.updateOne(
      {
        proposer: proposerId,
        target: targetId,
      },
      {
        status: accept ? FriendshipStatus.ACCEPTED : FriendshipStatus.REJECTED,
      },
    );

    if (accept) {
      await this.recommendationService.reviewRecommendation(
        targetId,
        proposerId,
        { accept: true },
        false,
      );

      // Notify the proposer about the acceptance of the request

      try {
        await this.mailingService.sendEmail({
          source: this.config.friendshipRequestsSenderEmail,
          destination: {
            toAddresses: [proposerUser.email],
          },
          subject: `${targetUser.profile.name} aceptó tu solicitud de amistad`,
          body: {
            html:
              `<p>¡Hola ${proposerUser.profile.name}! ${targetUser.profile.name} aceptó tu solicitud de amistad.</p>` +
              `<p>Ingresa a tu cuenta de <a href="${this.config.frontendFriendsUrl}">MindHub</a> para empezar a hablar.</p>`,
          },
        });
      } catch (error) {
        console.error(error);
      }

      try {
        await this.notificationService.createAppNotification({
          targetUserId: proposerId,
          type: NotificationType.ACCEPTED_FRIENDSHIP_PROPOSAL,
          payload: {
            counterpartyId: targetId,
            counterpartyName: targetUser?.profile?.name ?? '',
          },
        });
      } catch (error) {
        console.error(error);
      }
    }
  }
}
