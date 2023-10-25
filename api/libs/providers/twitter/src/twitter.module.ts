import { Module } from '@nestjs/common';
import { TwitterSyncService } from '.';

@Module({
  providers: [TwitterSyncService],
  exports: [TwitterSyncService],
})
export class TwitterModule {}
