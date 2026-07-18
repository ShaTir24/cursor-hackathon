import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still run a compare to avoid leaking length via timing on empty path alone.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.VIDEO_CREATION_API_KEY?.trim();
    if (!expected) {
      throw new UnauthorizedException(
        'VIDEO_CREATION_API_KEY is not configured on the server',
      );
    }

    const request = context.switchToHttp().getRequest<Request>();
    const provided = String(request.headers['x-api-key'] ?? '').trim();
    if (!provided || !safeEqual(provided, expected)) {
      throw new UnauthorizedException('Invalid or missing x-api-key');
    }
    return true;
  }
}
