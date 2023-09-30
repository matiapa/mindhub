import { Module } from '@nestjs/common';
import { ApiProvidersModule } from './providers/providers.module';
import { ApiInterestsModule } from './interests/interests.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
    ApiProvidersModule,
    ApiInterestsModule,
  ],
})
export class AppModule {}
