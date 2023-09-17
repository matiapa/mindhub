import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@vendia/serverless-express';
import {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Callback,
  Context,
  Handler,
} from 'aws-lambda';
import { AppModule } from './app.module';
import { RequestListener } from 'http';
import { ValidationPipe } from '@nestjs/common';

let server: Handler;

async function bootstrap(): Promise<RequestListener> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.init();
  return app.getHttpAdapter().getInstance();
}

export const handler: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback,
): Promise<APIGatewayProxyResult> => {
  server = server ?? serverlessExpress({ app: await bootstrap() });
  return server(event, context, callback);
};
