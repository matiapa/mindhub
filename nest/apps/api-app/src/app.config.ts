import { FriendshipsConfig } from '@Feature/friendships/friendships.config';
import { ProvidersConfig } from '@Feature/providers';
import { UsersConfig } from '@Feature/users/users.config';
import { SpotifyConfig } from 'libs/providers/spotify/src';
import { Type, plainToInstance } from 'class-transformer';
import { ValidateNested, validateSync } from 'class-validator';
import { TextsConfig } from '@Feature/texts';
import { PersonalityConfig } from '@Feature/personalities';
import { MongoConfig } from '@Provider/mongodb';
import { InterestsConfig } from '@Feature/interests/interests.config';
import { CorsConfig } from './config/cors.config';
import { EnvConfig } from './config/env.config';
import { NotificationsConfig } from '@Feature/notifications';

class AppConfig {
  @Type()
  @ValidateNested()
  env: EnvConfig = new EnvConfig();

  @Type()
  @ValidateNested()
  cors: CorsConfig = new CorsConfig();

  @Type(() => UsersConfig)
  @ValidateNested()
  users = new UsersConfig();

  @Type(() => FriendshipsConfig)
  @ValidateNested()
  friendships = new FriendshipsConfig();

  @Type(() => ProvidersConfig)
  @ValidateNested()
  providers = new ProvidersConfig();

  @Type(() => InterestsConfig)
  @ValidateNested()
  interests = new InterestsConfig();

  @Type(() => TextsConfig)
  @ValidateNested()
  texts = new TextsConfig();

  @Type(() => PersonalityConfig)
  @ValidateNested()
  personalities = new PersonalityConfig();

  @Type(() => SpotifyConfig)
  @ValidateNested()
  spotify = new SpotifyConfig();

  @Type(() => NotificationsConfig)
  @ValidateNested()
  notifications = new NotificationsConfig();

  @Type(() => MongoConfig)
  @ValidateNested()
  mongo = new MongoConfig();
}

export const validate = (config: typeof process.env) => {
  process.env = { ...config };
  const loadedConfig = new AppConfig();

  const validatedConfig = plainToInstance(AppConfig, loadedConfig, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) throw new Error(errors.toString());

  return validatedConfig;
};
