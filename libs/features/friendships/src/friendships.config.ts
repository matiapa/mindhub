import { IsEmail, IsNotEmpty } from 'class-validator';

export class FriendshipsConfig {
  @IsEmail()
  @IsNotEmpty()
  friendshipRequestsSenderEmail: string =
    process.env.FRIENDSHIP_REQUESTS_SENDER_EMAIL!;
}
