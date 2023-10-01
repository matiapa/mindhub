import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import moment from 'moment';
import {
  UpdateProfileDto,
  UpdateProfileResDto,
  UpdateLastConnectionDto,
  UpdateLastConnectionResDto,
  GetPictureUploadUrlDto,
  SharedUserInfo,
  SharedUserInfoConfig,
  OptUserInfoFields,
} from './dto';
import { User, UserFilters } from './entities';
import { UsersRepository } from './users.repository';
import { UsersConfig } from './users.config';
import { getDistanceInKm } from 'libs/utils';
import { StorageService } from '@Provider/storage';
import { AuthenticationService } from '@Provider/authentication';
import { InterestsService, SharedInterestDto } from '@Feature/interests';

@Injectable()
export class UsersService {
  private config: UsersConfig;

  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly storageService: StorageService,
    private readonly authService: AuthenticationService,
    private readonly interestsService: InterestsService,
    configService: ConfigService,
  ) {
    this.config = configService.get<UsersConfig>('users')!;
  }

  public async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UpdateProfileResDto> {
    const userData = await this.authService.getUserAuthProviderData(
      userId,
      this.config.cognitoPoolId,
    );

    const updatedUser = await this.usersRepo.update({
      _id: userId,
      email: userData!.email,
      profile: {
        name: userData!.name,
        gender: dto.gender,
        birthday: dto.birthday,
        biography: dto.biography,
      },
    });

    return updatedUser.profile;
  }

  public async updateLastConnection(
    userId: string,
    dto: UpdateLastConnectionDto,
  ): Promise<UpdateLastConnectionResDto> {
    // TODO: Invalidate recomendations cache

    const updatedUser = await this.usersRepo.update({
      _id: userId,
      lastConnection: {
        date: new Date().toISOString(),
        lat: dto.latitude,
        long: dto.longitude,
      },
    });

    return updatedUser.lastConnection!;
  }

  public getPictureUploadUrl(
    userId: string,
    dto: GetPictureUploadUrlDto,
  ): Promise<string> {
    return this.storageService.getUploadUrl(
      this.config.picturesBucket,
      userId,
      this.config.pictureUploadUrlTtl,
      dto.fileMime,
    );
  }

  public async getAllUserIds(filter?: UserFilters): Promise<string[]> {
    // TODO: This method is temporal because its needed for the recommendation service
    // until the Big Five model is ready, once it is implemented this has to be removed
    return this.usersRepo.getAllIds(filter);
  }

  public async getUserEntity(id: string): Promise<User | undefined> {
    return this.usersRepo.getById(id);
  }

  public async getSharedUserInfo(
    ofUserId: string,
    withUserId: string,
    config: SharedUserInfoConfig,
  ): Promise<SharedUserInfo> {
    const user = await this.usersRepo.getById(ofUserId);
    if (!user) throw new NotFoundException('User not found');

    return this.mapEntityToSharedInfo(user, withUserId, config);
  }

  public async getManySharedUserInfo(
    ids: string[],
    withUserId: string,
    config: SharedUserInfoConfig,
  ): Promise<SharedUserInfo[]> {
    if (!ids.length) return [];

    const users = await this.usersRepo.getManyByIds(ids);

    return Promise.all(
      users.map((usr) => this.mapEntityToSharedInfo(usr, withUserId, config)),
    );
  }

  private async mapEntityToSharedInfo(
    user: User,
    withUserId: string,
    config: SharedUserInfoConfig,
  ): Promise<SharedUserInfo> {
    if (!config.optionalFields) config.optionalFields = [];

    // Calculate age

    const age = moment().diff(user.profile.birthday, 'years');

    // Calculate distance

    let distance: number | undefined;
    if (config.optionalFields.includes(OptUserInfoFields.DISTANCE)) {
      if (user.lastConnection?.lat) {
        const authenticatedUser = await this.usersRepo.getById(withUserId);

        if (authenticatedUser.lastConnection?.lat) {
          distance = getDistanceInKm(
            user.lastConnection.lat,
            user.lastConnection.long,
            authenticatedUser.lastConnection.lat,
            authenticatedUser.lastConnection.long,
          );
        }
      }
    }

    // Get picture URL

    let pictureUrl: string | undefined;
    if (config.optionalFields.includes(OptUserInfoFields.PICTURE_URL)) {
      pictureUrl = await this.storageService.getDownloadUrl(
        this.config.picturesBucket,
        withUserId,
        this.config.pictureDownloadUrlTtl,
      );
    }

    let sharedInterests: SharedInterestDto[] | undefined;
    if (config.optionalFields.includes(OptUserInfoFields.SHARED_INTERESTS)) {
      const res = await this.interestsService.getSharedInterests(
        user._id,
        withUserId,
      );
      sharedInterests = res.sharedInterests;
    }

    return {
      _id: user._id,
      profile: {
        name: user.profile.name,
        gender: user.profile.gender,
        age,
        biography: user.profile.biography,
      },
      distance,
      pictureUrl,
      sharedInterests,
    };
  }
}
