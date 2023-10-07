import { SyncResult } from '../entities/sync-result.entity';
import { Token } from '../entities/tokens.entity';
import { ProviderEnum } from '../enums/providers.enum';

export interface ProviderSyncService {
  providerName: ProviderEnum;

  syncFromApi(userId: string, refreshToken: string): Promise<SyncResult>;

  syncFromFile(userId: string, file: Buffer): Promise<SyncResult>;
}

export interface ProviderAuthService {
  providerName: ProviderEnum;

  getLoginUrl(forUserId: string): string;

  redeemAuthCode(ofUserId: string, code: string): Promise<Token>;
}
