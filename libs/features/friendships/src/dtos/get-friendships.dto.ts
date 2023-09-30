import { SharedUserInfoConfig } from '@Feature/users';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum FriendshipType {
  PROPOSED = 'proposed',
  RECEIVED = 'received',
  ESTABLISHED = 'established',
}

export class GetFriendshipsDto extends SharedUserInfoConfig {
  @IsEnum(FriendshipType)
  @IsNotEmpty()
  type: FriendshipType;
}
