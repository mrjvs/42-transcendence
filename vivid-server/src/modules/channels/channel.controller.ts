import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  UseGuards,
  Query,
  ForbiddenException,
  BadRequestException,
  Param,
  Body,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import {
  ChannelDto,
  ChannelEntity,
  ChannelOwnerDto,
  ChannelVisibility,
  IChannel,
} from '@/channel.entity';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { User } from '~/middleware/decorators/login.decorator';
import { UserEntity } from '@/user.entity';
import { ChannelRoleAuth } from '~/middleware/decorators/channel.decorator';
import { ChannelRoles } from '~/middleware/guards/channel.guards';
import { IJoinedChannel } from '~/models/joined_channels.entity';

@Controller('channels')
@UseGuards(AuthenticatedGuard)
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Get('/:id')
  @ChannelRoleAuth({
    channelParam: 'id',
    role: ChannelRoles.USER,
  })
  getChannel(@Param('id') channelId: string): Promise<ChannelEntity> {
    return this.channelService.findChannel(channelId, true, null);
  }

  @Get('/')
  getChannelList(
    @User() user: UserEntity,
    @Query('type') type: string,
  ): Promise<IChannel[]> {
    if (!type) type = 'public';
    if (!['public', 'private', 'all'].includes(type))
      throw new BadRequestException('invalidType');
    if (['private', 'all'].includes(type) && !user.isSiteAdmin())
      throw new ForbiddenException();
    return this.channelService.findAllOfType(<ChannelVisibility>type);
  }

  @Post('/')
  createChannel(
    @Body() requestBody: ChannelDto,
    @User() user: UserEntity,
  ): Promise<{ join: IJoinedChannel; channel: IChannel }> {
    return this.channelService.add(requestBody, user.id);
  }

  @Patch('/:id')
  @ChannelRoleAuth({
    channelParam: 'id',
    role: ChannelRoles.OWNER,
  })
  updateChannel(
    @Body() requestBody: ChannelDto,
    @Param('id') id: string,
  ): Promise<IChannel> {
    return this.channelService.update(requestBody, id);
  }

  @Delete('/:id')
  @ChannelRoleAuth({
    channelParam: 'id',
    role: ChannelRoles.OWNER,
    canAdmin: true,
  })
  removeChannel(@Param('id') id: string): Promise<{ id: string }> {
    return this.channelService.remove(id);
  }

  @Patch('/:id/owner')
  @ChannelRoleAuth({
    channelParam: 'id',
    role: ChannelRoles.OWNER,
    canAdmin: true,
  })
  changeOwner(
    @Param('id') id: string,
    @Body() body: ChannelOwnerDto,
  ): Promise<ChannelEntity> {
    return this.channelService.makeOwner(id, body.owner);
  }
}
