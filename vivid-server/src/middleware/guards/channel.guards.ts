import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserEntity } from '~/models/user.entity';

export enum ChannelRoles {
  USER,
  MOD,
  OWNER,
}

export interface ChannelRole {
  channel?: string;
  channelParam?: string;
  role: ChannelRoles;
  canAdmin?: boolean;
}

function getUserRolesFromChannel(user, channel) {
  const out = {
    user: false,
    mod: false,
    owner: false,
  };
  if (!user) return out;
  let channelObject = user.joined_channels.find(
    (v) => v.channel.id === channel,
  );
  if (!channelObject) return out;
  channelObject = channelObject.channel;
  out.user = true;

  if (channelObject.owner === user.id) out.owner = true;
  return out;
}

@Injectable()
export class ChannelRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<ChannelRole[]>(
      'channel_roles',
      context.getHandler(),
    );

    // no required roles, can go through
    if (!roles) {
      return true;
    }

    // loop through roles
    const request = context.switchToHttp().getRequest();
    const user: UserEntity = request.user;
    for (let role of roles) {
      let hasRole = false;
      let channel;
      if (role.canAdmin === undefined) role.canAdmin = false;
      if (role.channel) channel = role.channel;
      else if (role.channelParam) channel = request.params[role.channelParam];

      // if channel doesnt exist, throw error
      if (!channel) throw new InternalServerErrorException();

      // if its a siteadmin, allow and check next role
      if (role.canAdmin && user.isSiteAdmin()) continue;

      // check roles
      const userRoles = getUserRolesFromChannel(user, channel);
      if (role.role === ChannelRoles.USER && userRoles.user) hasRole = true;
      else if (role.role === ChannelRoles.MOD && userRoles.mod) hasRole = true;
      else if (role.role === ChannelRoles.OWNER && userRoles.owner)
        hasRole = true;

      if (!hasRole) return false;
    }

    // has passed roles, allow passing through
    return true;
  }
}
