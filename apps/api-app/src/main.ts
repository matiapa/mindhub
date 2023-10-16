import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { EnvConfig } from './config/env.config';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService>(ConfigService);
  const envConfig = configService.get<EnvConfig>('env');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.useLogger(envConfig.loggerLevels);

  app.enableCors(configService.get('cors'));

  await app.listen(envConfig.port, '0.0.0.0');

  console.log(
    `🚀  Application is running on: http://localhost:${envConfig.port}`,
  );
}

bootstrap();
