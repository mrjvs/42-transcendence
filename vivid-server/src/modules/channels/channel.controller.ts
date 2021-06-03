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
import { Observable, from } from 'rxjs';
import { ChannelService, ChannelTypes } from './channel.service';
import { ChannelDto, IChannel } from '@/channel.entity';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { User } from '~/middleware/decorators/login.decorator';
import { UserEntity } from '@/user.entity';
import { ChannelRoleAuth } from '~/middleware/decorators/channel.decorator';
import { ChannelRoles } from '~/middleware/guards/channel.guards';
import { DeleteResult, UpdateResult } from 'typeorm';

@Controller('channels')
@UseGuards(AuthenticatedGuard)
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Get('/:id')
  getChannel(@Param('id') channelId: string): Observable<IChannel> {
    return from(this.channelService.findChannel(channelId));
  }

  @Get('/')
  getChannelList(
    @User() user: UserEntity,
    @Query('type') type: string,
  ): Observable<IChannel[]> {
    if (!type) type = 'public';
    if (!['public', 'private', 'all'].includes(type))
      throw new BadRequestException('invalidType');
    if (['private', 'all'].includes(type) && !user.isSiteAdmin())
      throw new ForbiddenException();
    return this.channelService.findAllOfType(<ChannelTypes>type);
  }

  @Post('/')
  createChannel(
    @Body() requestBody: ChannelDto,
    @User() user: UserEntity,
  ): Promise<IChannel> {
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
  ): Promise<UpdateResult> {
    return this.channelService.update(requestBody, id);
  }

  @Delete('/:id')
  @ChannelRoleAuth({
    channelParam: 'id',
    role: ChannelRoles.OWNER,
    canAdmin: true,
  })
  removeChannel(@Param('id') id: string): Promise<DeleteResult> {
    return this.channelService.remove(id);
  }
}
