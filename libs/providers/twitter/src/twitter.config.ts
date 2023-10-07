import { IsNotEmpty, IsString } from 'class-validator';

export class TwitterConfig {
  @IsString()
  @IsNotEmpty()
  tweetsPath: string = process.env.TWITTER_ZIP_TWEETS_PATH!;
}
