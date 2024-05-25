import { IsNotEmpty, IsString } from 'class-validator';

export class PostMessageDto {
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}
