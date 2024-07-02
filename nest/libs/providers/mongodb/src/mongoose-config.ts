import { MongoConfig } from './config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const createMongooseOptions = (
  config: MongoConfig,
): MongooseModuleOptions => {
  const { connection: connection, dbName: dbName, ...options } = config;

  return {
    uri: `${connection}/${dbName}`,
    ...options,
  };
};
