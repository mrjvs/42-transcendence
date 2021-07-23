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

export interface IUserParam {
  id: string;
  isSelf: boolean;
}

export const UserParam = createParamDecorator(
  (data: string, ctx: ExecutionContext): IUserParam => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    const param = request.params[data];

    const out: IUserParam = {
      id: param,
      isSelf: false,
    };

    // if its @me, set to user id
    if (out.id === '@me') out.id = user.id;

    // set isSelf
    if (out.id === user.id) out.isSelf = true;

    return out;
  },
);
