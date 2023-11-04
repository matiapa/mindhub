import { Interest } from '@Feature/interests/entities/interest.entity';
import { ProviderEnum } from '../enums/providers.enum';
import { Text } from '@Feature/texts';

export interface SyncResult {
  interests?: Interest[];
  texts?: Text[];
}

export interface ProviderSyncService {
  providerName: ProviderEnum;

  syncFromApi(userId: string, refreshToken: string): Promise<SyncResult>;

  syncFromFile(userId: string, file: Buffer): Promise<SyncResult>;
}

export interface OAuthToken {
  refreshToken: string;
  scopes: string;
}

export interface ProviderAuthService {
  providerName: ProviderEnum;

  getLoginUrl(state: string): string;

  redeemAuthCode(code: string): Promise<OAuthToken>;
}
