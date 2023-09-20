import { getCurrentInvoke } from '@vendia/serverless-express';
import AWS from 'aws-sdk';

const cognito = new AWS.CognitoIdentityServiceProvider();

export function getAuthenticadedUserId() {
  if (process.env.STAGE === 'local')
    return '15dcd4c2-98c0-4140-bd17-3effbca27c8b';
  const { event } = getCurrentInvoke();
  return event['requestContext']['authorizer']['claims']['sub'];
}

export async function getCognitoInfo(userId) {
  const data = await cognito
    .listUsers({
      UserPoolId: process.env.USERS_POOL_ID!,
      Filter: `sub = "${userId}"`,
      Limit: 1,
    })
    .promise();

  if (!data.Users!.length) return undefined;

  const attributes = data.Users![0].Attributes!;

  return {
    email: attributes.find((attr) => attr['Name'] === 'email')!['Value']!,
    name: attributes.find((attr) => attr['Name'] === 'name')!['Value']!,
  };
}
