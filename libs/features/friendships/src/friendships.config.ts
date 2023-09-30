import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class FriendshipsConfig {
  @IsString()
  @IsNotEmpty()
  friendshipsTableName: string = process.env.FRIENDSHIPS_TABLE_NAME!;

  @IsEmail()
  @IsNotEmpty()
  friendshipRequestsSenderEmail: string =
    process.env.FRIENDSHIP_REQUESTS_SENDER_EMAIL!;
}
