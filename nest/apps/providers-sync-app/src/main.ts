import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log('Using NODE_ENV: ', process.env.NODE_ENV);

  await app.listen(3001);
}
bootstrap();
