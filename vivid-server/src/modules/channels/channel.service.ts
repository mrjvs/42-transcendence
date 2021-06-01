import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Observable, from } from 'rxjs';
import { ChannelEntity, IChannel, ChannelDto } from '@/channel.entity';
import {
  JoinedChannelEntity,
  IJoinedChannel,
  IJoinedChannelInput,
} from '@/joined_channels.entity';
import { MessageEntity, IMessage, IMessageInput } from '@/messages.entity';

export enum ChannelTypes {
  PUBLIC = 'public',
  PRIVATE = 'private',
  ALL = 'private',
}

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

  // TODO hash passwords
  async add(channelInput: ChannelDto, userId: string): Promise<IChannel> {
    const input: IChannel = {
      has_password: channelInput.hasPassword,
      is_public: channelInput.isPublic,
      password: '',
      title: channelInput.title,
      owner: userId,
    };
    if (input.has_password) input.password = channelInput.password;
    const saveResult = await this.ChannelRepository.save(input);
    await this.JoinedChannelRepository.save({
      channel: saveResult.id,
      user: saveResult.owner,
    });
    return saveResult;
  }

  // TODO hash passwords
  async update(
    channelInput: ChannelDto,
    channelId: string,
  ): Promise<UpdateResult> {
    const input = {
      has_password: channelInput.hasPassword,
      is_public: channelInput.isPublic,
      password: '',
      title: channelInput.title,
    };
    if (input.has_password) input.password = channelInput.password;
    const updateResult = await this.ChannelRepository.createQueryBuilder()
      .update()
      .set(input)
      .where('id = :id', { id: channelId })
      .execute();
    return updateResult;
  }

  async remove(channel_id: string): Promise<DeleteResult> {
    await this.JoinedChannelRepository.createQueryBuilder()
      .delete()
      .where('channel = :id', { id: channel_id })
      .execute();
    const result = await this.ChannelRepository.delete(channel_id);
    return result;
  }

  async findChannel(id: string): Promise<IChannel> {
    return await this.ChannelRepository.findOne({
      relations: ['joined_users', 'joined_users.user'],
      where: {
        id,
      },
    });
  }

  findAllOfType(type: ChannelTypes): Observable<IChannel[]> {
    const query = {
      where: {},
    };
    if (type === 'public') query.where = { is_public: true };
    else if (type === 'private') query.where = { is_public: false };
    return from(this.ChannelRepository.find(query));
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
