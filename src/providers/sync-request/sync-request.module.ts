import { Module } from '@nestjs/common';
import { SyncRequestService } from './sync-request.service';

@Module({
  providers: [SyncRequestService],
  exports: [SyncRequestService],
})
export class SyncRequestModule {}
