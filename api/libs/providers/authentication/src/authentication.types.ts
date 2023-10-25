export interface TokenPayload {
  'cognito:username': string;
  email: string;
}

export interface PrincipalData {
  id: string;
  email: string;
}
