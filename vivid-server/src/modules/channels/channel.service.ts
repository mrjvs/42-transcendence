import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

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
    private configService: ConfigService,
  ) {}

  async add(channelInput: ChannelDto, userId: string): Promise<IChannel> {
    const input: IChannel = {
      has_password: channelInput.hasPassword,
      is_public: channelInput.isPublic,
      password: '',
      title: channelInput.title,
      owner: userId,
    };
    if (input.has_password) {
      input.password = await bcrypt.hash(
        channelInput.password,
        this.configService.get('saltRounds'),
      );
    }
    const saveResult = await this.ChannelRepository.save(input);
    await this.JoinedChannelRepository.save({
      channel: saveResult.id,
      user: saveResult.owner,
    });
    return saveResult;
  }

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

    if (input.has_password) {
      input.password = await bcrypt.hash(
        channelInput.password,
        this.configService.get('saltRounds'),
      );
    }
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

  async addUser(
    joinedChannelInput: IJoinedChannelInput,
  ): Promise<IJoinedChannel | UpdateResult> {
    const channel = await this.findChannel(joinedChannelInput.channel);
    if (!channel) throw new NotFoundException();

    // if password, validate
    if (
      channel.has_password &&
      (!joinedChannelInput.password ||
        !(await bcrypt.compare(joinedChannelInput.password, channel.password)))
    )
      throw new ForbiddenException();

    const alreadyJoined = await this.JoinedChannelRepository.findOne({
      where: {
        user: joinedChannelInput.user,
        channel: joinedChannelInput.channel,
      },
    });

    // record already exists
    if (alreadyJoined) {
      if (alreadyJoined.is_joined)
        throw new ConflictException(null, 'User is already joined');
      const newJoin = await this.JoinedChannelRepository.update(alreadyJoined, {
        is_joined: true,
      });
      return newJoin;
    }

    // create new join
    return await this.JoinedChannelRepository.save({
      channel: joinedChannelInput.channel,
      user: joinedChannelInput.user,
    });
  }

  async makeUserMod(
    channel: string,
    user: string,
    isMod: boolean = true,
  ): Promise<UpdateResult> {
    return await this.JoinedChannelRepository.createQueryBuilder()
      .update()
      .where({
        channel,
        user,
        is_joined: true,
      })
      .set({ is_mod: isMod })
      .execute();
  }

  // TODO catch error in case of no changes
  async updateUserPunishments(
    channel: string,
    user: string,
    isMuted?: boolean,
    isBanned?: boolean,
    muteExpiry?: number,
    banExpiry?: number,
  ): Promise<UpdateResult> {
    let builder: any = this.JoinedChannelRepository.createQueryBuilder()
      .update()
      .where({
        channel,
        user,
      });
    if (isMuted !== null) {
      let expiry: any = muteExpiry;
      if (expiry !== null) expiry = new Date(Date.now() + expiry * 1000);
      builder = builder.set({ is_muted: isMuted, muted_expiry: expiry });
    }
    if (isBanned !== null) {
      let expiry: any = banExpiry;
      if (expiry !== null) expiry = new Date(Date.now() + expiry * 1000);
      builder = builder.set({ is_banned: isBanned, ban_expiry: expiry });
    }
    return builder.execute();
  }

  async removeUser(
    joinedChannelInput: IJoinedChannelInput,
  ): Promise<DeleteResult | UpdateResult> {
    const channel = await this.findChannel(joinedChannelInput.channel);
    if (!channel) throw new NotFoundException();

    const alreadyRemoved = await this.JoinedChannelRepository.findOne({
      where: {
        user: joinedChannelInput.user,
        channel: joinedChannelInput.channel,
      },
    });
    if (!alreadyRemoved || !alreadyRemoved.is_joined)
      throw new ConflictException(null, 'User has already been removed');

    // if has mute or ban, set joined value to false
    if (alreadyRemoved.is_muted || alreadyRemoved.is_banned) {
      const result = await this.JoinedChannelRepository.update(alreadyRemoved, {
        is_joined: false,
      });
      return result;
    }

    return await this.JoinedChannelRepository.delete(alreadyRemoved);
  }

  listUsers(channelId: string): Observable<JoinedChannelEntity[]> {
    return from(
      this.JoinedChannelRepository.find({
        where: {
          is_joined: true,
          channel: channelId,
        },
      }),
    );
  }

  listUser(channelId: string, id: string): Observable<JoinedChannelEntity> {
    return from(
      this.JoinedChannelRepository.findOne({
        where: {
          user: id,
          channel: channelId,
        },
      }),
    );
  }
}
