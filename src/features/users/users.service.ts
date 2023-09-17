import { Injectable, NotFoundException } from '@nestjs/common';
import {
  UpdateProfileDto,
  UpdateProfileResDto,
} from './dto/update-profile.dto';
import {
  UpdateLastConnectionDto,
  UpdateLastConnectionResDto,
} from './dto/update-last-connection.dto';
import { GetPictureUploadUrlDto } from './dto/get-picture-upload-url.dto';
import { GetUserResDto } from './dto/get-user.dto';
import { UsersRepository } from './users.repository';
import { StorageService } from 'src/providers/storage/storage.service';
import { getAuthenticadedUserId } from 'src/utils/auth';
import { getDistanceInKm } from 'src/utils/location';
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
    const updatedUser = await this.usersRepo.update({
      _id: getAuthenticadedUserId(),
      profile: {
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

    return updatedUser.lastConnection;
  }

  public getPictureUploadUrl(dto: GetPictureUploadUrlDto): Promise<string> {
    const key = getAuthenticadedUserId();

    return this.storageService.getUploadUrl(
      process.env.S3_PICTURES_BUCKET,
      key,
      Number(process.env.S3_PICTURE_UPLOAD_URL_TTL),
      dto.fileMime,
    );
  }

  public async getUser(id: string): Promise<GetUserResDto> {
    // TODO: Incorporate personality information

    const user = await this.usersRepo.getById(id);
    if (!user) throw new NotFoundException('User not found');

    // Calculate age

    const age = moment().diff(user.profile.birthday, 'years');

    // Calculate distance

    let distance: number;
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

    // Get picture URl

    const key = getAuthenticadedUserId();
    const pictureUrl = await this.storageService.getDownloadUrl(
      process.env.S3_PICTURES_BUCKET,
      key,
      Number(process.env.S3_PICTURE_DOWNLOAD_URL_TTL),
    );

    return {
      _id: id,
      gender: user.profile.gender,
      age,
      biography: user.profile.biography,
      distance,
      pictureUrl,
    };
  }
}
