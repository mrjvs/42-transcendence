import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  Param,
  Body,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ChannelRoleAuth } from '~/middleware/decorators/channel.decorator';
import { User } from '~/middleware/decorators/login.decorator';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import {
  ChannelRoles,
  getUserRolesFromChannel,
} from '~/middleware/guards/channel.guards';
import {
  AddonDto,
  IMessage,
  IMessageInput,
  MessageDto,
  MessageEntity,
} from '@/messages.entity';
import { UserEntity } from '@/user.entity';
import { ChannelMessageService } from './channel.message.service';
import { Observable } from 'rxjs';
import { PongService } from '$/pong/pong.service';

@Controller('channels/:id/messages')
@UseGuards(AuthenticatedGuard)
export class ChannelMessageController {
  constructor(
    private messageService: ChannelMessageService,
    private pongService: PongService,
  ) {}

  @Get('/')
  @ChannelRoleAuth(
    {
      role: ChannelRoles.USER,
      channelParam: 'id',
    },
    {
      notRole: ChannelRoles.BANNED,
      channelParam: 'id',
    },
  )
  getMessageHistory(
    @Param('id') channelId: string,
  ): Observable<MessageEntity[]> {
    return this.messageService.getMessages(channelId, null);
  }

  @Post('/')
  @ChannelRoleAuth(
    {
      role: ChannelRoles.USER,
      channelParam: 'id',
    },
    {
      notRole: ChannelRoles.BANNED,
      channelParam: 'id',
    },
    {
      notRole: ChannelRoles.MUTED,
      channelParam: 'id',
    },
  )
  createMessage(
    @Body() messageBody: MessageDto,
    @User() user: UserEntity,
    @Param('id') channelId: string,
  ): Promise<IMessage> {
    const input: IMessageInput = {
      content: messageBody.content,
      aux_content: null,
      message_type: 0,
      user: user.id,
      channel: channelId,
    };
    return this.messageService.postMessage(user, input);
  }

  @Post('/secret')
  @ChannelRoleAuth(
    {
      role: ChannelRoles.USER,
      channelParam: 'id',
    },
    {
      notRole: ChannelRoles.BANNED,
      channelParam: 'id',
    },
    {
      notRole: ChannelRoles.MUTED,
      channelParam: 'id',
    },
  )
  createSecretMessage(
    @User() user: UserEntity,
    @Param('id') channelId: string,
  ): Promise<IMessage> {
    const input: IMessageInput = {
      content: '',
      aux_content: null,
      message_type: 42,
      user: user.id,
      channel: channelId,
    };
    return this.messageService.postMessage(user, input);
  }

  @Post('/duel')
  @ChannelRoleAuth(
    {
      role: ChannelRoles.USER,
      channelParam: 'id',
    },
    {
      notRole: ChannelRoles.BANNED,
      channelParam: 'id',
    },
    {
      notRole: ChannelRoles.MUTED,
      channelParam: 'id',
    },
  )
  createDuelMessage(
    @Body() body: AddonDto,
    @User() user: UserEntity,
    @Param('id') channelId: string,
  ): Promise<IMessage> {
    const gameId = this.pongService.createGame('duel', null, body.addons);
    this.pongService.joinGame(user.id, gameId);
    const input: IMessageInput = {
      content: '',
      aux_content: { invite_game_id: gameId },
      message_type: 1,
      user: user.id,
      channel: channelId,
    };
    return this.messageService.postMessage(user, input);
  }

  @Post('/:message/duel')
  @ChannelRoleAuth(
    {
      role: ChannelRoles.USER,
      channelParam: 'id',
    },
    {
      notRole: ChannelRoles.BANNED,
      channelParam: 'id',
    },
    {
      notRole: ChannelRoles.MUTED,
      channelParam: 'id',
    },
  )
  async acceptDuelMessage(
    @User() user: UserEntity,
    @Param('message') messageId: string,
    @Param('id') channelId: string,
  ): Promise<{ gameId: string }> {
    const message: MessageEntity = await this.messageService.getMessage(
      channelId,
      messageId,
    );
    if (!message) throw new NotFoundException();
    if (message.message_type !== 1) throw new BadRequestException();
    const game = this.pongService.joinGame(
      user.id,
      message.aux_content.invite_game_id,
    );
    if (!game) return { gameId: message.aux_content.invite_game_id };
    return {
      gameId: game.gameId,
    };
  }

  @Delete('/:message')
  @ChannelRoleAuth({
    role: ChannelRoles.USER,
    channelParam: 'id',
  })
  async deleteMessage(
    @Param('id') channelId: string,
    @Param('message') messageId: string,
    @User() user: UserEntity,
  ): Promise<{ id: string }> {
    const { mod } = getUserRolesFromChannel(user, channelId);

    return await this.messageService.deleteMessage(
      channelId,
      messageId,
      mod ? undefined : user.id, // if moderator, dont check for message owner
    );
  }
}
