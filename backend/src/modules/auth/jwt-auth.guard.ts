import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
  SetMetadata,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as jose from 'jose';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export type AuthUser = { userId: string; email?: string };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (!req.user) throw new UnauthorizedException();
    return req.user;
  },
);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private jwks: ReturnType<typeof jose.createRemoteJWKSet> | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  private getJwks() {
    if (this.jwks) return this.jwks;
    const base = this.config.get<string>('SUPABASE_URL')?.replace(/\/$/, '');
    if (!base) return null;
    this.jwks = jose.createRemoteJWKSet(
      new URL(`${base}/auth/v1/.well-known/jwks.json`),
    );
    return this.jwks;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      user?: AuthUser;
    }>();

    // Dev bypass for local HLS demos without Supabase project
    if (this.config.get('AUTH_DEV_BYPASS') === 'true') {
      const devId = req.headers['x-user-id'];
      if (!devId) throw new UnauthorizedException('Missing x-user-id (AUTH_DEV_BYPASS)');
      req.user = { userId: String(devId) };
      return true;
    }

    const auth = req.headers['authorization'];
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token');
    }
    const token = auth.slice(7);

    try {
      const payload = await this.verifyToken(token);
      const sub = payload.sub;
      if (!sub || typeof sub !== 'string') {
        throw new UnauthorizedException('Invalid token subject');
      }
      req.user = {
        userId: sub,
        email: typeof payload.email === 'string' ? payload.email : undefined,
      };
      return true;
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Prefer Supabase JWKS (ES256 signing keys). Fall back to legacy HS256 JWT secret.
   */
  private async verifyToken(token: string): Promise<jose.JWTPayload> {
    const jwks = this.getJwks();
    if (jwks) {
      try {
        const { payload } = await jose.jwtVerify(token, jwks);
        return payload;
      } catch {
        // Fall through to HS256 secret if configured (legacy projects)
      }
    }

    const secret = this.config.get<string>('SUPABASE_JWT_SECRET');
    if (secret) {
      const { payload } = await jose.jwtVerify(
        token,
        new TextEncoder().encode(secret),
        { algorithms: ['HS256'] },
      );
      return payload;
    }

    if (!jwks) {
      throw new UnauthorizedException(
        'Auth not configured: set SUPABASE_URL (JWKS) or SUPABASE_JWT_SECRET',
      );
    }
    throw new UnauthorizedException('Invalid or expired token');
  }
}
