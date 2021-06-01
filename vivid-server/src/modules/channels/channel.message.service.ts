import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Observable, from } from 'rxjs';

import { MessageEntity, IMessage, IMessageInput } from '@/messages.entity';

@Injectable()
export class ChannelMessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private MessageRepository: Repository<MessageEntity>,
  ) {}

  postMessage(messageInput: IMessageInput): Observable<IMessage> {
    return from(this.MessageRepository.save(messageInput));
  }

  getMessages(id: string): Observable<IMessage[]> {
    return from(
      this.MessageRepository.createQueryBuilder()
        .where({ channel: id })
        .orderBy('created_at', 'ASC')
        .getMany(),
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
