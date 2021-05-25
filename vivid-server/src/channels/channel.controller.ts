import { Body, Controller, Get, Post, Param, Delete } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DeleteResult } from 'typeorm';
import { ChannelService } from './channel.service';
import { IChannel, ChannelDto } from './models/channel.entity';
import {
  UserJoinedChannelDto,
  IJoinedChannel,
  IJoinedChannelInput,
} from './models/joined_channels.entity';
import { IMessageInput, MessageDto, IMessage } from './models/messages.entity';

@Controller('channels')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Get('/')
  getAll(): Observable<IChannel[]> {
    return this.channelService.findAll();
  }

  @Get('/:id')
  getId(@Param('id') id: string): Promise<IChannel> {
    return this.channelService.findChannel(id);
  }

  @Post('/')
  createChannel(@Body() channel: ChannelDto): Observable<IChannel> {
    return this.channelService.add(channel);
  }

  @Post('/:id/users')
  joinChannel(
    @Param('id') id: string,
    @Body() channel: UserJoinedChannelDto,
  ): Observable<IJoinedChannel> {
    const populatedChannel: IJoinedChannelInput = {
      ...channel,
      channel_id: id,
    };
    return this.channelService.addUser(populatedChannel);
  }

  @Delete('/:id/users')
  exitChannel(
    @Param('id') id: string,
    @Body() channel: UserJoinedChannelDto,
  ): Observable<DeleteResult> {
    const populatedChannel: IJoinedChannelInput = {
      ...channel,
      channel_id: id,
    };
    return this.channelService.removeUser(populatedChannel);
  }

  @Post('/:id/messages')
  postMessage(
    @Param('id') id: string,
    @Body() data: MessageDto,
  ): Observable<IMessage> {
    const populatedMessage: IMessageInput = {
      ...data,
      channel: id,
    };
    return this.channelService.postMessage(populatedMessage);
  }

  @Get('/:id/messages')
  getMessages(@Param('id') id: string): Observable<IMessage[]> {
    return this.channelService.getMessages(id);
  }
}
