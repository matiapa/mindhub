import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class SpotifySdkConfig {
  @IsString()
  @IsNotEmpty()
  clientId: string = process.env.SPOTIFY_CLIENT_ID!;

  @IsString()
  @IsNotEmpty()
  clientSecret: string = process.env.SPOTIFY_CLIENT_SECRET!;

  @IsString()
  @IsNotEmpty()
  requestedScopes: string = process.env.SPOTIFY_REQUESTED_SCOPES!;

  @IsUrl()
  @IsNotEmpty()
  authCodeRedeemUrl: string = process.env.SPOTIFY_AUTH_CODE_REDEEM_URL!;
}
