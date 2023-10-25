import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class MongoConfig {
  @ValidateIf(() => process.env.NODE_ENV !== 'test')
  @IsNotEmpty()
  @IsString()
  connection?: string = process.env.MONGO_ATLAS_URI;

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
