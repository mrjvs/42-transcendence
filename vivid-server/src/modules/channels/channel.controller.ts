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
  Put,
} from '@nestjs/common';
import { ChannelService, ChannelTypes } from './channel.service';
import { ChannelDto, IChannel } from '@/channel.entity';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { User } from '~/middleware/decorators/login.decorator';
import { UserEntity } from '@/user.entity';
import { ChannelRoleAuth } from '~/middleware/decorators/channel.decorator';
import { ChannelRoles } from '~/middleware/guards/channel.guards';
import { PongService } from '$/pong/pong.service';

// TODO only show sensitive info if joined (like other users or passwords)
@Controller('channels')
@UseGuards(AuthenticatedGuard)
export class ChannelController {
  constructor(
    private channelService: ChannelService,
    private pongService: PongService,
  ) {}

  @Put('/game/:game_id')
  joinGame(
    @User() user: UserEntity,
    @Param('game_id') gameId: string,
  ): { gameId: string } {
    return this.pongService.joinGame(user.id, gameId);
  }

  @Post('/game')
  createGame(@User() user: UserEntity): { gameId: string } {
    const gameId = this.pongService.createGame();
    return this.pongService.joinGame(user.id, gameId);
  }

  @Get('/:id')
  @ChannelRoleAuth({
    channelParam: 'id',
    role: ChannelRoles.USER,
  })
  getChannel(@Param('id') channelId: string): Promise<IChannel> {
    return this.channelService.findChannel(channelId);
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
}
