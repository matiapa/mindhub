import { ProviderEnum } from '../enums/providers.enum';

export enum SyncSource {
  API = 'api',
  FILE = 'file',
}

export class SyncRequest {
  userId: string;
  provider: ProviderEnum;
  requester: string;
  source: SyncSource;
}
