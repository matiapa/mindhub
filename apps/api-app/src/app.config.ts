import { InterestsConfig } from '@Feature/interests';
import { ProvidersConfig } from '@Feature/providers';
import { ResourcesConfig } from '@Feature/resources';
import { SpotifySdkConfig } from '@Provider/spotify-sdk';
import { Type, plainToInstance } from 'class-transformer';
import { ValidateNested, validateSync } from 'class-validator';

class AppConfig {
  @Type(() => InterestsConfig)
  @ValidateNested()
  interests = new InterestsConfig();

  @Type(() => ResourcesConfig)
  @ValidateNested()
  resources = new ResourcesConfig();

  @Type(() => ProvidersConfig)
  @ValidateNested()
  providers = new ProvidersConfig();

  @Type(() => SpotifySdkConfig)
  @ValidateNested()
  spotify = new SpotifySdkConfig();
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
