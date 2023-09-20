import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities';
import {
  UpdateProfileDto,
  UpdateProfileResDto,
  UpdateLastConnectionDto,
  UpdateLastConnectionResDto,
  GetPictureUploadUrlDto,
  UserInfo,
  UserInfoConfig,
  OptUserInfoFields,
} from './dto';
import { UsersRepository } from './users.repository';
import { StorageService } from 'src/providers/storage';
import {
  getAuthenticadedUserId,
  getCognitoInfo,
  getDistanceInKm,
} from 'src/utils';
import moment from 'moment';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly storageService: StorageService,
  ) {}

  public async updateProfile(
    dto: UpdateProfileDto,
  ): Promise<UpdateProfileResDto> {
    const authenticatedUserId = getAuthenticadedUserId();

    const cognitoInfo = await getCognitoInfo(authenticatedUserId);

    const updatedUser = await this.usersRepo.update({
      _id: authenticatedUserId,
      email: cognitoInfo!.email,
      profile: {
        name: cognitoInfo!.name,
        gender: dto.gender,
        birthday: dto.birthday,
        biography: dto.biography,
      },
    });

    return updatedUser.profile;
  }

  public async updateLastConnection(
    dto: UpdateLastConnectionDto,
  ): Promise<UpdateLastConnectionResDto> {
    // TODO: Invalidate recomendations cache

    const updatedUser = await this.usersRepo.update({
      _id: getAuthenticadedUserId(),
      lastConnection: {
        date: new Date().toISOString(),
        lat: dto.latitude,
        long: dto.longitude,
      },
    });

    return updatedUser.lastConnection!;
  }

  public getPictureUploadUrl(dto: GetPictureUploadUrlDto): Promise<string> {
    const key = getAuthenticadedUserId();

    return this.storageService.getUploadUrl(
      process.env.S3_PICTURES_BUCKET!,
      key,
      Number(process.env.S3_PICTURE_UPLOAD_URL_TTL),
      dto.fileMime,
    );
  }

  public async getUser(id: string): Promise<User | undefined> {
    return this.usersRepo.getById(id);
  }

  public async getUserInfo(
    id: string,
    config: UserInfoConfig,
  ): Promise<UserInfo> {
    const user = await this.usersRepo.getById(id);
    if (!user) throw new NotFoundException('User not found');

    return this.mapUserEntityToUserInfo(user, config);
  }

  public async getManyUsersInfo(
    ids: string[],
    config: UserInfoConfig,
  ): Promise<UserInfo[]> {
    if (!ids.length) return [];

    const users = await this.usersRepo.getManyByIds(ids);

    return Promise.all(
      users.map((usr) => this.mapUserEntityToUserInfo(usr, config)),
    );
  }

  // eslint-disable-next-line prettier/prettier
  private async mapUserEntityToUserInfo(user: User, config: UserInfoConfig): Promise<UserInfo> {
    if (!config.optionalFields) config.optionalFields = [];

    // Calculate age

    const age = moment().diff(user.profile.birthday, 'years');

    // Calculate distance

    let distance: number | undefined;
    if (config.optionalFields.includes(OptUserInfoFields.DISTANCE)) {
      if (user.lastConnection?.lat) {
        const authenticatedUser = await this.usersRepo.getById(
          getAuthenticadedUserId(),
        );

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
        process.env.S3_PICTURES_BUCKET!,
        getAuthenticadedUserId(),
        Number(process.env.S3_PICTURE_DOWNLOAD_URL_TTL),
      );
    }

    // TODO: Get common interests

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
    };
  }
}
