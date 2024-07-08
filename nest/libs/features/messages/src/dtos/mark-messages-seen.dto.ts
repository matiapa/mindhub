import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class MarkMessagesSeenDto {
  @IsArray()
  @IsNotEmpty()
  messageIds: string[];
}
