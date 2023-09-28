import { ProvidersModule } from '@Feature/providers';
import { QueueModule } from '@Provider/queue';
import { Module } from '@nestjs/common';

@Module({
  imports: [QueueModule, ProvidersModule],
})
export class ConsumersAppModule {}
