import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsUrl, ValidateNested } from 'class-validator';

class SyncConfig {
  @IsUrl()
  @IsNotEmpty()
  requestsQueueUrl: string = process.env.PROVIDERS_SYNC_REQUESTS_QUEUE_URL!;
}

class ApiConfig {
  @IsUrl()
  @IsNotEmpty()
  codeRedeemRedirectUrl: string =
    process.env.PROVIDERS_API_CODE_REDEEM_REDIRECT_URL!;

  @IsString()
  @IsNotEmpty()
  tokensTableName: string = process.env.PROVIDERS_API_TOKENS_TABLE_NAME!;
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

  @Type(() => ApiConfig)
  @ValidateNested()
  api: ApiConfig = new ApiConfig();

  @Type(() => FileConfig)
  @ValidateNested()
  file: FileConfig = new FileConfig();
}
