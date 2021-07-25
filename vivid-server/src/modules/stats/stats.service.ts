import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JoinedChannelEntity } from '~/models/joined_channels.entity';
import { MessageEntity } from '~/models/messages.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(JoinedChannelEntity)
    private joinedChannelsRepository: Repository<JoinedChannelEntity>,
    @InjectRepository(MessageEntity)
    private messagesRepository: Repository<MessageEntity>,
  ) {}

  async userMessagesCount(userId: string): Promise<number> {
    const result = await this.joinedChannelsRepository
      .createQueryBuilder('joined_channels')
      .innerJoinAndSelect(
        'messages',
        'message',
        'joined_channels.user = message.user',
      )
      .where('joined_channels.user = :id', { id: userId })
      .getMany();

    console.log(result);

    return 1;
  }
}
