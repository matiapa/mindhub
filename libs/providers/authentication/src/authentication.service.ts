import { Injectable } from '@nestjs/common';
import AWS from 'aws-sdk';

export interface UserAuthProviderData {
  email: string;
  name: string;
}

@Injectable()
export class AuthenticationService {
  private cognito = new AWS.CognitoIdentityServiceProvider();

  async getUserAuthProviderData(
    userId: string,
    userPoolId: string,
  ): Promise<UserAuthProviderData> {
    const data = await this.cognito
      .listUsers({
        UserPoolId: userPoolId,
        Filter: `sub = "${userId}"`,
        Limit: 1,
      })
      .promise();

    if (!data.Users!.length) throw Error(`The user ${userId} does not exist`);

    const attributes = data.Users![0].Attributes!;

    return {
      email: attributes.find((attr) => attr['Name'] === 'email')!['Value']!,
      name: attributes.find((attr) => attr['Name'] === 'name')!['Value']!,
    };
  }
}
