import { ProvidersConfig } from '@Feature/providers';
import { SpotifyConfig } from 'libs/providers/spotify/src';
import { Type, plainToInstance } from 'class-transformer';
import { ValidateNested, validateSync } from 'class-validator';
import { TwitterConfig } from 'libs/providers/twitter/src';
import { TextsConfig } from '@Feature/texts';
import { MongoConfig } from '@Provider/mongodb';
import { InterestsConfig } from '@Feature/interests/interests.config';

class AppConfig {
  @Type(() => ProvidersConfig)
  @ValidateNested()
  providers = new ProvidersConfig();

  @Type(() => InterestsConfig)
  @ValidateNested()
  interests = new InterestsConfig();

  @Type(() => TextsConfig)
  @ValidateNested()
  texts = new TextsConfig();

  @Type(() => SpotifyConfig)
  @ValidateNested()
  spotify = new SpotifyConfig();

  @Type(() => TwitterConfig)
  @ValidateNested()
  twitter = new TwitterConfig();

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
