import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UsersConfig {
  @IsString()
  @IsNotEmpty()
  tableName: string = process.env.USERS_TABLE_NAME!;

  @IsString()
  @IsNotEmpty()
  cognitoPoolId: string = process.env.USERS_POOL_ID!;

  @IsString()
  @IsNotEmpty()
  picturesBucket: string = process.env.USERS_PICTURES_BUCKET!;

  @IsNumber()
  @IsNotEmpty()
  pictureUploadUrlTtl: number = Number(
    process.env.USERS_PICTURE_UPLOAD_URL_TTL!,
  );

  @IsNumber()
  @IsNotEmpty()
  pictureDownloadUrlTtl: number = Number(
    process.env.USERS_PICTURE_DOWNLOAD_URL_TTL!,
  );
}
