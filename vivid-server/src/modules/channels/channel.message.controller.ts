import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  Param,
  Body,
} from '@nestjs/common';
import { ChannelRoleAuth } from '~/middleware/decorators/channel.decorator';
import { User } from '~/middleware/decorators/login.decorator';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import {
  ChannelRoles,
  getUserRolesFromChannel,
} from '~/middleware/guards/channel.guards';
import { IMessageInput, MessageDto } from '@/messages.entity';
import { UserEntity } from '@/user.entity';
import { ChannelMessageService } from './channel.message.service';
import { DeleteResult } from 'typeorm';

@Controller('channels/:id/messages')
@UseGuards(AuthenticatedGuard)
export class ChannelMessageController {
  constructor(private messageService: ChannelMessageService) {}

  // TODO time based pagination
  // TODO add ban checks
  @Get('/')
  @ChannelRoleAuth({
    role: ChannelRoles.USER,
    channelParam: 'id',
  })
  getMessageHistory(@Param('id') channelId: string): any {
    return this.messageService.getMessages(channelId);
  }

  // TODO add mute/ban checks
  @Post('/')
  @ChannelRoleAuth({
    role: ChannelRoles.USER,
    channelParam: 'id',
  })
  createMessage(
    @Body() messageBody: MessageDto,
    @User() user: UserEntity,
    @Param('id') channelId: string,
  ): any {
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
  ): Promise<DeleteResult> {
    const { mod } = getUserRolesFromChannel(user, channelId);

    return await this.messageService.deleteMessage(
      channelId,
      messageId,
      mod ? undefined : user.id, // if moderator, dont check for message owner
    );
  }
}
