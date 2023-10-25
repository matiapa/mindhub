import { IsNotEmpty, IsString } from 'class-validator';

export class ProposeFriendshipDto {
  @IsString()
  @IsNotEmpty()
  target: string;
}
