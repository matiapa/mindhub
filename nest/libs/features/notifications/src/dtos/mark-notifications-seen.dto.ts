import { IsNotEmpty, IsArray } from 'class-validator';

export class MarkNotificationsSeen {
  @IsArray()
  @IsNotEmpty()
  ids: string[];
}
