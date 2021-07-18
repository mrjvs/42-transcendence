import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ChannelEntity,
  IChannel,
  ChannelDto,
  IChannelInput,
} from '@/channel.entity';
import {
  JoinedChannelEntity,
  IJoinedChannel,
  IJoinedChannelInput,
} from '@/joined_channels.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EventGateway } from '../websocket/event.gateway';

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
    private configService: ConfigService,
    private readonly eventGateway: EventGateway,
  ) {}

  async add(channelInput: ChannelDto, userId: string): Promise<IChannel> {
    const input: IChannelInput = {
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
  ): Promise<ChannelEntity> {
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
      .returning('*')
      .execute()
      .then((response) => {
        return <ChannelEntity>response.raw[0];
      });
    this.eventGateway.updateChannel(
      updateResult.id,
      updateResult.joined_users,
      updateResult,
    );
    return updateResult;
  }

  async remove(channel_id: string): Promise<{ id: string }> {
    const channel = await this.ChannelRepository.findOne({
      relations: ['joined_users'],
      where: { id: channel_id },
    });
    if (!channel) throw new NotFoundException();
    await this.JoinedChannelRepository.createQueryBuilder()
      .delete()
      .where('channel = :id', { id: channel_id })
      .execute();
    const result = await this.ChannelRepository.delete(channel_id);
    if (result.affected !== 1) throw new InternalServerErrorException();
    this.eventGateway.removeChannel(channel_id, channel.joined_users);
    return { id: channel_id };
  }

  async findChannel(id: string, resolveUsers = true): Promise<IChannel> {
    const relations = ['joined_users'];
    if (resolveUsers) relations.push('joined_users.user');
    return await this.ChannelRepository.findOne({
      relations,
      where: {
        id,
      },
    });
  }

  findAllOfType(type: ChannelTypes): Promise<IChannel[]> {
    const query = {
      where: {},
    };
    if (type === 'public') query.where = { is_public: true };
    else if (type === 'private') query.where = { is_public: false };
    return this.ChannelRepository.find(query);
  }

  async addUser(
    joinedChannelInput: IJoinedChannelInput,
  ): Promise<IJoinedChannel> {
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

    // record already exists, update
    if (alreadyJoined) {
      if (alreadyJoined.is_joined)
        throw new ConflictException(null, 'User is already joined');
      const newJoin = await this.JoinedChannelRepository.save({
        id: alreadyJoined.id,
        is_joined: true,
      });
      this.eventGateway.updateChannelUser(
        joinedChannelInput.channel,
        channel.joined_users,
        newJoin,
      );
      return newJoin;
    }

    // create new join
    const newUser = await this.JoinedChannelRepository.save({
      channel: joinedChannelInput.channel,
      user: joinedChannelInput.user,
    });
    this.eventGateway.updateChannelUser(
      joinedChannelInput.channel,
      channel.joined_users,
      newUser,
    );
    return newUser;
  }

  async makeUserMod(
    channelId: string,
    user: string,
    isMod = true,
  ): Promise<IJoinedChannel> {
    const channel = await this.findChannel(channelId);
    if (!channel) throw new NotFoundException();

    const res = await this.JoinedChannelRepository.createQueryBuilder()
      .update()
      .where({
        channel: channelId,
        user,
        is_joined: true,
      })
      .set({ is_mod: isMod })
      .returning('*')
      .execute()
      .then((response) => {
        return <JoinedChannelEntity>response.raw[0];
      });

    this.eventGateway.updateChannelUser(channelId, channel.joined_users, res);
    return res;
  }

  async updateUserPunishments(
    channelId: string,
    user: string,
    isMuted?: boolean,
    isBanned?: boolean,
    muteExpiry?: number,
    banExpiry?: number,
  ): Promise<IJoinedChannel> {
    const channel = await this.findChannel(channelId);
    if (!channel) throw new NotFoundException();

    let builder: any = this.JoinedChannelRepository.createQueryBuilder()
      .update()
      .where({
        channel: channelId,
        user,
      });
    let hasChanges = false;
    if (isMuted !== null) {
      hasChanges = true;
      let expiry: any = muteExpiry;
      if (expiry !== null) expiry = new Date(Date.now() + expiry * 1000);
      builder = builder.set({ is_muted: isMuted, muted_expiry: expiry });
    }
    if (isBanned !== null) {
      hasChanges = true;
      let expiry: any = banExpiry;
      if (expiry !== null) expiry = new Date(Date.now() + expiry * 1000);
      builder = builder.set({ is_banned: isBanned, ban_expiry: expiry });
    }
    if (!hasChanges) throw new BadRequestException();
    builder = builder.returning('*');
    const res = await builder.execute().then((response) => {
      return <JoinedChannelEntity>response.raw[0];
    });

    this.eventGateway.updateChannelUser(channelId, channel.joined_users, res);
    return res;
  }

  async removeUser(
    joinedChannelInput: IJoinedChannelInput,
  ): Promise<{ id: string }> {
    const channel = await this.findChannel(joinedChannelInput.channel);
    if (!channel) throw new NotFoundException();
    if (channel.owner === joinedChannelInput.user)
      throw new ForbiddenException(null, 'Cannot remove owner from channel');

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
      await this.JoinedChannelRepository.update(alreadyRemoved, {
        is_joined: false,
      });
      this.eventGateway.leaveChannelUser(
        joinedChannelInput.channel,
        channel.joined_users,
        joinedChannelInput.user,
      );
      return { id: joinedChannelInput.user };
    }

    await this.JoinedChannelRepository.delete(alreadyRemoved);
    this.eventGateway.leaveChannelUser(
      joinedChannelInput.channel,
      channel.joined_users,
      joinedChannelInput.user,
    );
    return { id: joinedChannelInput.user };
  }

  async listUsers(channelId: string): Promise<JoinedChannelEntity[]> {
    if (!(await this.ChannelRepository.findOne(channelId)))
      throw new NotFoundException();
    return await this.JoinedChannelRepository.find({
      where: {
        is_joined: true,
        channel: channelId,
      },
    });
  }

  async listUser(channelId: string, id: string): Promise<JoinedChannelEntity> {
    const user = await this.JoinedChannelRepository.findOne({
      where: {
        user: id,
        channel: channelId,
      },
    });
    if (!user) throw new NotFoundException();
    return user;
  }
}
