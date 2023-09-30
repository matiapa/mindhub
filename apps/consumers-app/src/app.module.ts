import { ProvidersModule } from '@Feature/providers';
import { QueueModule } from '@Provider/queue';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './app.config';

@Module({
  imports: [
    QueueModule,
    ProvidersModule,
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
