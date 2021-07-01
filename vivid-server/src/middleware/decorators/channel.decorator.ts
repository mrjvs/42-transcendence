import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ChannelRoleGuard, ChannelRole } from '../guards/channel.guards';

export function ChannelRoleAuth(...roles: ChannelRole[]) {
  return applyDecorators(
    SetMetadata('channel_roles', roles),
    UseGuards(ChannelRoleGuard),
  );
}
