import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';
import { PrincipalData, TokenPayload } from './authentication.types';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { UsersConfig } from '@Feature/users/users.config';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { CognitoJwtVerifierSingleUserPool } from 'aws-jwt-verify/cognito-verifier';

@Injectable()
export class AuthGuard implements CanActivate {
  config: UsersConfig;
  verifier: CognitoJwtVerifierSingleUserPool<{
    userPoolId: string;
    clientId: string;
    tokenUse: 'id';
  }>;

  constructor(configService: ConfigService) {
    this.config = configService.get<UsersConfig>('users');

    this.verifier = CognitoJwtVerifier.create({
      userPoolId: this.config.cognitoPoolId,
      clientId: this.config.cognitoClientId,
      tokenUse: 'id',
    });

    // Fetch and cache the JWKS for all configured issuers
    this.verifier.hydrate();
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);
    if (!token) return false;

    try {
      request['user'] = await this.verifyToken(token);
    } catch (error) {
      console.warn('Failed to verify token', { token, error });
      throw new UnauthorizedException();
    }

    return true;
  }

  public async verifyToken(token: string) {
    return await this.verifier.verify(token, {});
  }

  public extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

export const AuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PrincipalData => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: TokenPayload }>();
    return {
      email: request.user.email,
      id: request.user['sub'],
    };
  },
);
