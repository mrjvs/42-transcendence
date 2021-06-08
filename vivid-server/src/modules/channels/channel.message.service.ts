import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DeleteResult, Repository } from 'typeorm';
import { Observable, from } from 'rxjs';

import {
  MessageEntity,
  IMessage,
  IMessageInput,
  PaginationDto,
} from '@/messages.entity';

@Injectable()
export class ChannelMessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private MessageRepository: Repository<MessageEntity>,
  ) {}

  postMessage(messageInput: IMessageInput): Observable<IMessage> {
    return from(this.MessageRepository.save(messageInput));
  }

  getMessages(
    id: string,
    paginationDto: PaginationDto,
  ): Observable<MessageEntity[]> {
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

  async deleteMessage(
    channelId: string,
    messageId: string,
    userId?: string,
  ): Promise<DeleteResult> {
    let builder: any = this.MessageRepository.createQueryBuilder();
    builder = builder
      .delete()
      .where('channel = :channelId', { id: channelId })
      .where('id = :messageId', { messageId: messageId });

    if (userId) {
      builder = builder.where('user = :owner', { owner: userId });
    }

    return await builder.execute();
  }
}
