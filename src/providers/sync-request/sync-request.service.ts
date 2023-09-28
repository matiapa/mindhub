import { Injectable } from '@nestjs/common';
import AWS from 'aws-sdk';
import { Consumer } from 'sqs-consumer';
import { ProviderEnum } from 'src/features/resources/enums';

export interface SyncRequestMessage {
  userId: string;
  provider: ProviderEnum;
  requester: string;
}

@Injectable()
export class SyncRequestService {
  private sqs = new AWS.SQS();

  private consumers: Consumer[] = [];

  async createRequest(message: SyncRequestMessage): Promise<void> {
    await this.sqs.sendMessage({
      MessageBody: JSON.stringify(message),
      QueueUrl: process.env.SYNC_REQUESTS_SQS_QUEUE!,
    });
  }

  async registerHandler(
    handler: (SyncRequestMessage) => Promise<void>,
  ): Promise<void> {
    const consumer = Consumer.create({
      queueUrl: process.env.SYNC_REQUESTS_SQS_QUEUE!,
      handleMessage: async (message) => {
        const data: SyncRequestMessage = JSON.parse(message.Body!);
        await handler(data);
      },
    });

    consumer.on('error', (err) => {
      console.error(err.message);
    });

    consumer.on('processing_error', (err) => {
      console.error(err.message);
    });

    consumer.start();

    this.consumers.push(consumer);
  }
}
