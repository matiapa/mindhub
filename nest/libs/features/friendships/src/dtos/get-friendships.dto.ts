import { RecommendationScore } from '@Feature/recommendations/entities/recommendation.entity';
import { SharedUserInfo, SharedUserInfoConfig } from '@Feature/users';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';

export enum FriendshipType {
  PROPOSED = 'proposed',
  RECEIVED = 'received',
  ESTABLISHED = 'established',
}

export class GetFriendshipsReqDto extends SharedUserInfoConfig {
  @IsEnum(FriendshipType)
  @IsNotEmpty()
  type: FriendshipType;
}

export class FriendshipDto {
  @Type(() => SharedUserInfo)
  @ValidateNested()
  user: SharedUserInfo;

  @Type(() => RecommendationScore)
  @ValidateNested()
  score: RecommendationScore;
}

export class GetFriendshipsResDto {
  @IsArray()
  @Type(() => FriendshipDto)
  @ValidateNested({ each: true })
  friends: FriendshipDto[];
}
