import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): { id: string } => {
    const request = ctx.switchToHttp().getRequest<{ user: { id: string } }>();
    return request.user;
  },
);
