import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  Param,
  Body,
  // Query,
} from '@nestjs/common';
import { ChannelRoleAuth } from '~/middleware/decorators/channel.decorator';
import { User } from '~/middleware/decorators/login.decorator';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import {
  ChannelRoles,
  getUserRolesFromChannel,
} from '~/middleware/guards/channel.guards';
import {
  IMessage,
  IMessageInput,
  MessageDto,
  MessageEntity,
  // PaginationDto,
} from '@/messages.entity';
import { UserEntity } from '@/user.entity';
import { ChannelMessageService } from './channel.message.service';
import { Observable } from 'rxjs';

@Controller('channels/:id/messages')
@UseGuards(AuthenticatedGuard)
export class ChannelMessageController {
  constructor(private messageService: ChannelMessageService) {}

  // TODO time based pagination (make it better)
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
    // @Query() paginationDto: PaginationDto,
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
      user: user.id,
      channel: channelId,
    };
    return this.messageService.postMessage(input);
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
