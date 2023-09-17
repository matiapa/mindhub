import { getCurrentInvoke } from '@vendia/serverless-express';

export function getAuthenticadedUserId() {
  const { event } = getCurrentInvoke();
  return event['requestContext']['authorizer']['claims']['sub'];
}
