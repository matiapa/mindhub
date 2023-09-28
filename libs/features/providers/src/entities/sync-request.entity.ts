import { ProviderEnum } from '../enums/providers.enum';

export interface SyncRequest {
  userId: string;
  provider: ProviderEnum;
  requester: string;
}
