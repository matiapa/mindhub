import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { SignupState, User } from './entities';
import { UsersRepository } from './users.repository';
import { UsersConfig } from './users.config';
import { getDistanceInKm } from 'libs/utils';
import { StorageService } from '@Provider/storage';
import { AuthenticationService } from '@Provider/authentication';
import { InterestsService, SharedInterestDto } from '@Feature/interests';
import {
  PersonalitiesService,
  UserPersonalityDto,
} from '@Feature/personalities';
import { GetOwnUserResDto } from './dto/get-own-user.dto';
import { RatesService } from '@Feature/rates/rates.service';
import { SignupReqDto } from './dto/signup.dto';
import jwt from 'jsonwebtoken';

@Injectable()
export class UsersService {
  private config: UsersConfig;

  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly interestsService: InterestsService,
    private readonly personalitiesService: PersonalitiesService,
    private readonly ratesService: RatesService,
    private readonly storageService: StorageService,
    private readonly authService: AuthenticationService,
    configService: ConfigService,
  ) {
    this.config = configService.get<UsersConfig>('users')!;
  }

  public async signup(dto: SignupReqDto): Promise<void> {
    let decoded: any;
    try {
      decoded = jwt.verify(
        dto.token,
        process.env.COGNITO_SIGNUP_HANDLER_SECRET_KEY,
      );
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }

    await this.usersRepo.updateOne(
      { _id: decoded['_id'] },
      {
        _id: decoded['_id'],
        email: decoded['email'],
        profile: {
          name: decoded['name'],
        } as any,
        signupState: SignupState.PENDING_PROFILE,
      },
      { upsert: true },
    );
  }

  // ----------------- UPDATE OPS -----------------

  public async updateProfile(
    userId: string,
    dto: UpdateProfileReqDto,
  ): Promise<void> {
    await this.usersRepo.updateOne(
      { _id: userId },
      {
        profile: {
          gender: dto.gender,
          birthday: new Date(dto.birthday),
          biography: dto.biography,
        } as any,
      },
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
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      profile: user.profile,
      signupState: user.signupState,
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

    // return Promise.all(
    //   users.map((usr) => this.mapEntityToSharedInfo(usr, withUserId, config)),
    // );

    return this.mapEntitiesToSharedInfo(users, withUserId, config);
  }

  private async mapEntityToSharedInfo(
    user: User,
    withUserId: string,
    config: SharedUserInfoConfig,
  ): Promise<SharedUserInfo> {
    if (!config.optionalFields) config.optionalFields = [];

    // Calculate age

    const age = moment().diff(user.profile.birthday, 'years');

    // Calculate inactive hours

    const inactiveHours = user.lastConnection
      ? moment().diff(user.lastConnection.date, 'hours')
      : Infinity;

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

    // Get shared interests

    let sharedInterests: SharedInterestDto[] | undefined;
    if (config.optionalFields.includes(OptUserInfoFields.SHARED_INTERESTS)) {
      const res = await this.interestsService.getSharedInterests([
        user['_id'],
        withUserId,
      ]);
      sharedInterests = res.sharedInterests;
    }

    // Get user personality

    let personality: UserPersonalityDto;
    if (config.optionalFields.includes(OptUserInfoFields.PERSONALITY)) {
      personality = await this.personalitiesService.getUserPersonality(
        user['_id'],
      );
    }

    // Get rating
    let rating: number | undefined;
    if (config.optionalFields.includes(OptUserInfoFields.RATING)) {
      rating = await this.ratesService.getRate(withUserId, user['_id']);
    }

    return {
      _id: user['_id'],
      profile: {
        name: user.profile.name,
        gender: user.profile.gender,
        age,
        biography: user.profile.biography,
      },
      inactiveHours,
      distance,
      sharedInterests,
      personality,
      rating,
    };
  }

  private async mapEntitiesToSharedInfo(
    users: User[],
    withUserId: string,
    config: SharedUserInfoConfig,
  ): Promise<SharedUserInfo[]> {
    if (!config.optionalFields) config.optionalFields = [];

    // Calculate age

    const ages = users.map((user) =>
      moment().diff(user.profile.birthday, 'years'),
    );

    // Calculate inactive hours

    const inactiveHours = users.map((user) =>
      user.lastConnection
        ? moment().diff(user.lastConnection.date, 'hours')
        : Infinity,
    );

    // Calculate distances

    let distances: (number | undefined)[] | undefined;
    if (config.optionalFields.includes(OptUserInfoFields.DISTANCE)) {
      const authenticatedUser = await this.usersRepo.getOne({
        _id: withUserId,
      });

      distances = users.map((user) => {
        if (user.lastConnection?.location) {
          if (authenticatedUser.lastConnection?.location) {
            return getDistanceInKm(
              user.lastConnection.location.coordinates[1],
              user.lastConnection.location.coordinates[0],
              authenticatedUser.lastConnection.location.coordinates[1],
              authenticatedUser.lastConnection.location.coordinates[0],
            );
          }
        }
      });
    }

    // Get shared interests

    let sharedInterests: SharedInterestDto[][] | undefined;
    if (config.optionalFields.includes(OptUserInfoFields.SHARED_INTERESTS)) {
      sharedInterests = await Promise.all(
        users.map(async (user) => {
          const res = await this.interestsService.getSharedInterests([
            user['_id'],
            withUserId,
          ]);
          return res.sharedInterests;
        }),
      );
    }

    // Get user personalities

    let personalities: (UserPersonalityDto | undefined)[] | undefined;
    if (config.optionalFields.includes(OptUserInfoFields.PERSONALITY)) {
      const res = await this.personalitiesService.getUsersPersonalities(
        users.map((user) => user['_id']),
      );

      personalities = users.map((user) => {
        const personality = res.find((p) => p.userId === user['_id']);
        return {
          o: personality?.o,
          c: personality?.c,
          e: personality?.e,
          a: personality?.a,
          n: personality?.n,
        };
      });
    }

    // Get rating
    let ratings: (number | undefined)[] | undefined;
    if (config.optionalFields.includes(OptUserInfoFields.RATING)) {
      const res = await this.ratesService.getGivenRates(withUserId);

      ratings = users.map((user) => {
        const rate = res.rates.find((r) => r.rateeId === user['_id']);
        return rate?.rating;
      });
    }

    return users.map((user, i) => ({
      _id: user['_id'],
      profile: {
        name: user.profile.name,
        gender: user.profile.gender,
        age: ages[i],
        biography: user.profile.biography,
      },
      inactiveHours: inactiveHours[i],
      distance: distances?.[i],
      sharedInterests: sharedInterests?.[i],
      personality: personalities?.[i],
      rating: ratings?.[i],
    }));
  }
}
