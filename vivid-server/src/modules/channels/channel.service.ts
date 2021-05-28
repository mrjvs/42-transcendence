import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Observable, from } from 'rxjs';
import { ChannelEntity, IChannel, ChannelDto } from '@/channel.entity';
import {
  JoinedChannelEntity,
  IJoinedChannel,
  IJoinedChannelInput,
} from '@/joined_channels.entity';
import { MessageEntity, IMessage, IMessageInput } from '@/messages.entity';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(ChannelEntity)
    private ChannelRepository: Repository<ChannelEntity>,
    @InjectRepository(JoinedChannelEntity)
    private JoinedChannelRepository: Repository<JoinedChannelEntity>,
    @InjectRepository(MessageEntity)
    private MessageRepository: Repository<MessageEntity>,
  ) {}

  add(channelInput: ChannelDto): Observable<IChannel> {
    return from(this.ChannelRepository.save(channelInput));
  }

  remove(channel_id: string): Observable<DeleteResult> {
    return from(this.ChannelRepository.delete(channel_id));
  }

  async findChannel(id: string): Promise<IChannel> {
    return await this.ChannelRepository.findOne({
      relations: ['joined_users', 'joined_users.user'],
      where: {
        id,
      },
    });
  }

  findAll(): Observable<IChannel[]> {
    return from(
      this.ChannelRepository.find({
        relations: ['joined_users', 'joined_users.user'],
      }),
    );
  }

  addUser(joinedChannelInput: IJoinedChannelInput): Observable<IJoinedChannel> {
    return from(this.JoinedChannelRepository.save(joinedChannelInput));
  }

  removeUser(
    joinedChannelInput: IJoinedChannelInput,
  ): Observable<DeleteResult> {
    return from(this.JoinedChannelRepository.delete({ ...joinedChannelInput }));
  }

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
}
