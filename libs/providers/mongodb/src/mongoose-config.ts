import { MongoConfig } from './config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const createMongooseOptions = (
  config: MongoConfig,
): MongooseModuleOptions => {
  const { connection: uri, ...options } = config;

  return {
    uri,
    ...options,
  };
};
