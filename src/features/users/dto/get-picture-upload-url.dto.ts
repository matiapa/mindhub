import { IsMimeType, IsNotEmpty } from 'class-validator';

export class GetPictureUploadUrlDto {
  @IsMimeType()
  @IsNotEmpty()
  fileMime: string;
}
