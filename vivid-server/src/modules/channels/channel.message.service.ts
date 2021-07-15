import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DeleteResult, Repository } from 'typeorm';
import { Observable, from } from 'rxjs';
import {
  MessageEntity,
  IMessage,
  IMessageInput,
  PaginationDto,
} from '@/messages.entity';
import { EventGateway } from '$/websocket/event.gateway';
import { ChannelService } from './channel.service';
import { UserEntity } from '@/user.entity';

@Injectable()
export class ChannelMessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private MessageRepository: Repository<MessageEntity>,
    private readonly eventGateway: EventGateway,
    private readonly channelService: ChannelService,
  ) {}

  async postMessage(
    user: UserEntity,
    messageInput: IMessageInput,
  ): Promise<IMessage> {
    const channel = await this.channelService.findChannel(
      messageInput.channel,
      false,
    );
    if (!channel) throw new NotFoundException();
    const result = await this.MessageRepository.save(messageInput);
    this.eventGateway.sendChannelMessage(result, channel.joined_users, user);
    return result;
  }

  getMessages(
    id: string,
    paginationDto?: PaginationDto,
  ): Observable<MessageEntity[]> {
    if (!paginationDto) {
      return from(
        this.MessageRepository.find({
          where: {
            channel: id,
          },
          order: {
            created_at: 'ASC',
          },
        }),
      );
    }
    return from(
      this.MessageRepository.find({
        where: {
          channel: id,
          created_at: Between(paginationDto.date1, paginationDto.date2),
        },
        order: {
          created_at: 'ASC',
        },
      }),
    );
  }

  async getMessage(
    channelId: string,
    messageId: string,
  ): Promise<MessageEntity> {
    return await this.MessageRepository.findOne({
      where: { channel: channelId, id: messageId },
    });
  }

  async deleteMessage(
    channelId: string,
    messageId: string,
    userId?: string,
  ): Promise<{ id: string }> {
    let builder: any = this.MessageRepository.createQueryBuilder();
    builder = builder
      .delete()
      .where('channel = :channelId', { id: channelId })
      .where('id = :messageId', { messageId: messageId });

    if (userId) {
      builder = builder.where('user = :owner', { owner: userId });
    }

    const result: DeleteResult = await builder.execute();
    if (result.affected !== 1) throw new NotFoundException();

    const channel = await this.channelService.findChannel(channelId, false);
    if (!channel) throw new NotFoundException();

    this.eventGateway.deleteChannelMessage(
      channelId,
      channel.joined_users,
      messageId,
    );
    return { id: messageId };
  }
}
