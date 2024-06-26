import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

class SyncConfig {
  @IsUrl()
  @IsNotEmpty()
  requestsQueueUrl: string = process.env.PROVIDERS_SYNC_REQUESTS_QUEUE_URL!;

  @IsNumber()
  @IsNotEmpty()
  maxRetries: number = Number(process.env.PROVIDERS_SYNC_MAX_RETRIES!);
}

class FileConfig {
  @IsString()
  @IsNotEmpty()
  bucket: string = process.env.PROVIDERS_FILES_BUCKET!;

  @IsString()
  @IsNotEmpty()
  uploadUrlTtl: string = process.env.PROVIDERS_FILE_UPLOAD_URL_TTL!;

  @IsUrl()
  @IsNotEmpty()
  uploadedQueueUrl: string = process.env.PROVIDERS_FILE_UPLOADED_QUEUE_URL!;
}

export class ProvidersConfig {
  @Type(() => SyncConfig)
  @ValidateNested()
  sync: SyncConfig = new SyncConfig();

  @Type(() => FileConfig)
  @ValidateNested()
  file: FileConfig = new FileConfig();
}
