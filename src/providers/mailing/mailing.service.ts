import { BadRequestException, Injectable } from '@nestjs/common';
import AWS from 'aws-sdk';

export class SendEmailParams {
  source: string;
  destination: {
    toAddresses?: string[];
    ccAddresses?: string[];
  };
  subject: string;
  body: {
    html: string;
  };
  replyTo?: string[];
}

@Injectable()
export class MailingService {
  private ses = new AWS.SES();

  async sendEmail(params: SendEmailParams): Promise<void> {
    const totalDests =
      (params.destination.toAddresses?.length ?? 0) +
      (params.destination.ccAddresses?.length ?? 0);

    if (totalDests == 0 || totalDests > 50) {
      throw new BadRequestException(
        'Total recipients must be between 1 and 50',
      );
    }

    const sendingParams = {
      Source: params.source,
      Destination: {
        CcAddresses: params.destination.ccAddresses,
        ToAddresses: params.destination.toAddresses,
      },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: params.subject,
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: params.body.html!,
          },
        },
      },
      ReplyToAddresses: params.replyTo,
    };

    await this.ses.sendEmail(sendingParams).promise();
  }
}
