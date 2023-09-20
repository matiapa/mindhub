import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserInfoConfig } from 'src/features/users';

export enum FriendshipType {
  PROPOSED = 'proposed',
  RECEIVED = 'received',
  ESTABLISHED = 'established',
}

export class GetFriendshipsDto extends UserInfoConfig {
  @IsEnum(FriendshipType)
  @IsNotEmpty()
  type: FriendshipType;
}
