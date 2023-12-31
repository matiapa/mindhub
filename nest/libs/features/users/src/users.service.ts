import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import moment from 'moment';
import {
  UpdateProfileReqDto,
  UpdateLastConnectionReqDto,
  GetPictureUploadUrlDto,
  SharedUserInfo,
  SharedUserInfoConfig,
  OptUserInfoFields,
} from './dto';
import { User } from './entities';
import { UsersRepository } from './users.repository';
import { UsersConfig } from './users.config';
import { getDistanceInKm } from 'libs/utils';
import { StorageService } from '@Provider/storage';
import { AuthenticationService } from '@Provider/authentication';
import { InterestsService, SharedInterestDto } from '@Feature/interests';
import { GetOwnUserResDto } from './dto/get-own-user.dto';

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

  // ----------------- UPDATE OPS -----------------

  public async updateProfile(
    userId: string,
    dto: UpdateProfileReqDto,
  ): Promise<void> {
    const userData = await this.authService.getUserAuthProviderData(
      userId,
      this.config.cognitoPoolId,
    );

    await this.usersRepo.updateOne(
      { _id: userId },
      {
        email: userData!.email,
        profile: {
          name: userData!.name,
          gender: dto.gender,
          birthday: new Date(dto.birthday),
          biography: dto.biography,
        },
      },
      { upsert: true },
    );
  }

  public async updateLastConnection(
    userId: string,
    dto: UpdateLastConnectionReqDto,
  ): Promise<void> {
    // TODO: Invalidate recomendations cache

    await this.usersRepo.updateOne(
      { _id: userId },
      {
        lastConnection: {
          location: {
            type: 'Point',
            // Longitude goes firtst on GeoJSON format
            coordinates: [dto.longitude, dto.latitude],
          },
          date: new Date(),
        },
      },
    );
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

  // ----------------- GET OPS -----------------

  public async getUserEntity(id: string): Promise<User | undefined> {
    return this.usersRepo.getOne({ _id: id });
  }

  public async getOwnUserInfo(id: string): Promise<GetOwnUserResDto> {
    const user = await this.usersRepo.getOne({ _id: id });

    const pictureUrl = await this.storageService.getDownloadUrl(
      this.config.picturesBucket,
      id,
      this.config.pictureDownloadUrlTtl,
    );

    return {
      profile: user.profile,
      pictureUrl,
    };
  }

  public async getSharedUserInfo(
    ofUserId: string,
    withUserId: string,
    config: SharedUserInfoConfig,
  ): Promise<SharedUserInfo> {
    const user = await this.usersRepo.getOne({ _id: ofUserId });
    if (!user) throw new NotFoundException('User not found');

    return this.mapEntityToSharedInfo(user, withUserId, config);
  }

  public async getManySharedUserInfo(
    ids: string[],
    withUserId: string,
    config: SharedUserInfoConfig,
  ): Promise<SharedUserInfo[]> {
    if (!ids.length) return [];

    const users = await this.usersRepo.getMany({ _id: { $in: ids } });

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
      if (user.lastConnection?.location) {
        const authenticatedUser = await this.usersRepo.getOne({
          _id: withUserId,
        });

        if (authenticatedUser.lastConnection?.location) {
          distance = getDistanceInKm(
            user.lastConnection.location.coordinates[1],
            user.lastConnection.location.coordinates[0],
            authenticatedUser.lastConnection.location.coordinates[1],
            authenticatedUser.lastConnection.location.coordinates[0],
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
      const res = await this.interestsService.getSharedInterests([
        user._id,
        withUserId,
      ]);
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
