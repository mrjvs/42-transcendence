import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ChannelEntity } from '@/channel.entity';
import { JoinedChannelEntity } from '@/joined_channels.entity';
import { UserEntity } from '@/user.entity';

export enum ChannelRoles {
  USER,
  MOD,
  OWNER,
  BANNED,
  MUTED,
}

export interface ChannelRole {
  channel?: string;
  channelParam?: string;
  role?: ChannelRoles;
  canAdmin?: boolean;
  notRole?: ChannelRoles;
}

export function getUserRolesFromChannel(user: UserEntity, channel: string) {
  const out = {
    user: false,
    mod: false,
    owner: false,
    isBanned: false,
    isMuted: false,
  };
  if (!user) return out;
  const joinObject: JoinedChannelEntity | undefined = user.joined_channels.find(
    (v) => (v.channel as any).id === channel,
  );
  if (!joinObject) return out;
  if (!joinObject.is_joined) return out;
  const channelObject: ChannelEntity = (joinObject as any).channel;
  out.user = true;

  if (channelObject.owner === user.id) {
    out.mod = true;
    out.owner = true;
  }

  if (joinObject.is_mod) out.mod = true;
  if (joinObject.is_muted) out.isMuted = true;
  if (joinObject.is_banned) out.isBanned = true;

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
    for (const role of roles) {
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
      let roleToCheck = role.role;
      if (role.notRole) roleToCheck = role.notRole;
      const userRoles = getUserRolesFromChannel(user, channel);
      if (roleToCheck === ChannelRoles.USER && userRoles.user) hasRole = true;
      else if (roleToCheck === ChannelRoles.MOD && userRoles.mod)
        hasRole = true;
      else if (roleToCheck === ChannelRoles.OWNER && userRoles.owner)
        hasRole = true;
      else if (roleToCheck === ChannelRoles.BANNED && userRoles.isBanned)
        hasRole = true;
      else if (roleToCheck === ChannelRoles.MUTED && userRoles.isMuted)
        hasRole = true;

      if (role.notRole !== undefined && hasRole) return false; // must not have role but does
      if (role.notRole === undefined && !hasRole) return false; // must have role, but does not
    }

    // has passed roles, allow passing through
    return true;
  }
}
