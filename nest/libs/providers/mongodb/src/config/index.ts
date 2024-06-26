import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class MongoConfig {
  @IsNotEmpty()
  @IsString()
  connection?: string = process.env.MONGO_URI;

  @IsNotEmpty()
  @IsString()
  dbName?: string = process.env.MONGO_DB;

  @IsOptional()
  @IsNumber()
  connectTimeoutMS: number = +(
    process.env.MONGO_CONNECTION_TIMEOUT_MS || 20000
  );

  @IsOptional()
  @IsNumber()
  retryAttempts: number = +(process.env.MONGO_CONNECTION_RETRY_ATTEMPTS || 5);

  @IsOptional()
  @IsNumber()
  retryDelay: number = +(process.env.MONGO_CONNECTION_RETRY_DELAY_MS || 5000);
}
