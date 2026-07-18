import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

/**
 * MVP JWT stand-in: Authorization: Bearer <userId>.
 * Replace with Supabase JWT verification when auth lands.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: { id: string };
    }>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token');
    }
    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Empty token');
    }
    request.user = { id: token };
    return true;
  }
}
