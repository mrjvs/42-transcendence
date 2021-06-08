import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  UseGuards,
  Param,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import {
  UserParam,
  IUserParam,
  User,
} from '~/middleware/decorators/login.decorator';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import {
  IJoinedChannelInput,
  UserJoinedChannelDto,
  UserPunishmentsDto,
  UserPermissionDto,
  JoinedChannelEntity,
  IJoinedChannel,
} from '@/joined_channels.entity';
import { ChannelService } from './channel.service';
import { UserEntity } from '~/models/user.entity';
import {
  ChannelRoles,
  getUserRolesFromChannel,
} from '~/middleware/guards/channel.guards';
import { ChannelRoleAuth } from '~/middleware/decorators/channel.decorator';
import { Observable } from 'rxjs';
import { DeleteResult, UpdateResult } from 'typeorm';

@Controller('channels/:id/users')
@UseGuards(AuthenticatedGuard)
export class ChannelUserController {
  constructor(private channelService: ChannelService) {}

  @Get('/')
  @ChannelRoleAuth({
    role: ChannelRoles.USER,
    channelParam: 'id',
  })
  getChannelUsers(
    @Param('id') channelId: string,
  ): Observable<JoinedChannelEntity[]> {
    return this.channelService.listUsers(channelId);
  }

  @Get('/:user')
  @ChannelRoleAuth({
    role: ChannelRoles.USER,
    channelParam: 'id',
  })
  getChannelUser(
    @Param('id') channelId: string,
    @Param('user') id: string,
  ): Observable<JoinedChannelEntity> {
    return this.channelService.listUser(channelId, id);
  }

  @Post('/:user')
  addChannelUser(
    @Param('id') channel: string,
    @Body() requestBody: UserJoinedChannelDto,
    @UserParam('user') userParam: IUserParam,
    @User() user: UserEntity,
  ): Promise<IJoinedChannel | UpdateResult> {
    // if its not self, must site admin
    if (!userParam.isSelf && !user.isSiteAdmin())
      throw new ForbiddenException();
    const input: IJoinedChannelInput = {
      channel,
      user: userParam.id,
      password: requestBody.password,
    };
    return this.channelService.addUser(input);
  }

  @Patch('/:user/permissions')
  @ChannelRoleAuth({
    role: ChannelRoles.OWNER,
    canAdmin: true,
    channelParam: 'id',
  })
  updateChannelUser(
    @Body() bodyRequests: UserPermissionDto,
    @Param('id') channel: string,
    @Param('user') user: string,
  ): Promise<UpdateResult> {
    return this.channelService.makeUserMod(channel, user, bodyRequests.isMod);
  }

  @Patch('/:user')
  @ChannelRoleAuth({
    role: ChannelRoles.MOD,
    canAdmin: true,
    channelParam: 'id',
  })
  updateChannelUserPermissions(
    @Body() bodyRequests: UserPunishmentsDto,
    @Param('id') channel: string,
    @Param('user') user: string,
  ): Promise<UpdateResult> {
    return this.channelService.updateUserPunishments(
      channel,
      user,
      bodyRequests.isMuted,
      bodyRequests.isBanned,
      bodyRequests.muteExpiry,
      bodyRequests.banExpiry,
    );
  }

  @Delete('/:user')
  removeChannelUser(
    @Param('id') channel: string,
    @UserParam('user') userParam: IUserParam,
    @User() user: UserEntity,
  ): Promise<DeleteResult | UpdateResult> {
    const { mod } = getUserRolesFromChannel(user, channel);
    // if its not self, must be mod or site admin
    if (!userParam.isSelf && !(mod || user.isSiteAdmin()))
      throw new ForbiddenException();
    const input: IJoinedChannelInput = {
      channel,
      user: userParam.id,
    };
    return this.channelService.removeUser(input);
  }
}
