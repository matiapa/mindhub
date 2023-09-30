import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
export class ProvidersConfig {
  @IsString()
  @IsNotEmpty()
  tokensTableName: string = process.env.PROVIDERS_TOKENS_TABLE_NAME!;

  @IsUrl()
  @IsNotEmpty()
  codeRedeemRedirectUrl: string =
    process.env.PROVIDERS_CODE_REDEEM_REDIRECT_URL!;

  syncRequestsQueueUrl: string = process.env.PROVIDERS_SYNC_REQUESTS_QUEUE_URL!;
}
