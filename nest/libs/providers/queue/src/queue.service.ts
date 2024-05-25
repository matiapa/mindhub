import { Injectable, Logger } from '@nestjs/common';
import AWS from 'aws-sdk';
import { Consumer } from 'sqs-consumer';

@Injectable()
export class QueueService {
  private sqs = new AWS.SQS();

  private consumers: Consumer[] = [];

  private readonly logger = new Logger(QueueService.name);

  async sendMessage<K>(queueUrl: string, message: K): Promise<string> {
    this.logger.debug('Sending message', { queue: queueUrl, message });

    const res = await this.sqs
      .sendMessage({
        MessageBody: JSON.stringify(message),
        QueueUrl: queueUrl,
      })
      .promise();

    this.logger.debug('Message sent', { id: res.MessageId });

    return res.MessageId!;
  }

  async registerHandler<K>(
    queueUrl: string,
    handler: (message: K) => Promise<void>,
  ): Promise<void> {
    const consumer = Consumer.create({
      queueUrl: queueUrl,
      handleMessage: async (message) => {
        const data = JSON.parse(message.Body!);

        this.logger.debug('Received message', { queue: queueUrl, messageId: message.MessageId, data });

        await handler(data);

        this.logger.debug('Message processed');
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
