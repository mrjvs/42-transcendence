import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * User decorator
 *
 * Takes property name as key and returns associated value if exists
 */
export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
