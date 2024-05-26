import { IsEmail, IsNotEmpty, IsUrl } from 'class-validator';

export class FriendshipsConfig {
  @IsEmail()
  @IsNotEmpty()
  friendshipRequestsSenderEmail: string =
    process.env.FRIENDSHIP_REQUESTS_SENDER_EMAIL!;

  @IsUrl()
  @IsNotEmpty()
  frontendFriendsUrl: string = `${process.env.FRONTEND_BASE_URL}/friends`;
}
