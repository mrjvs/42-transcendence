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
  ChannelTypes,
  ChannelVisibility,
} from '@/channel.entity';
import {
  JoinedChannelEntity,
  IJoinedChannel,
  IJoinedChannelInput,
} from '@/joined_channels.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EventGateway } from '$/websocket/event.gateway';
import { ChannelMessageService } from './channel.message.service';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(ChannelEntity)
    private ChannelRepository: Repository<ChannelEntity>,
    @InjectRepository(JoinedChannelEntity)
    private JoinedChannelRepository: Repository<JoinedChannelEntity>,
    private configService: ConfigService,
    private readonly eventGateway: EventGateway,
    private readonly channelMessageService: ChannelMessageService,
  ) {}

  async add(channelInput: ChannelDto, userId: string): Promise<IChannel> {
    const input: IChannelInput = {
      has_password: channelInput.hasPassword,
      is_public: channelInput.isPublic,
      password: '',
      title: channelInput.title,
      owner: userId,
      type: ChannelTypes.TEXT,
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

  async addDmChannel(user1: string, user2: string): Promise<ChannelEntity> {
    const input: IChannelInput = {
      has_password: false,
      is_public: false,
      password: '',
      title: '',
      owner: null,
      type: ChannelTypes.DM,
      dmId: (user1 > user2 ? [user2, user1] : [user1, user2]).join('='),
    };
    const saveResult = await this.ChannelRepository.save(input);
    await this.JoinedChannelRepository.save({
      channel: saveResult.id,
      user: user1,
      is_joined: true,
    });
    await this.JoinedChannelRepository.save({
      channel: saveResult.id,
      user: user2,
      is_joined: true,
    });
    return saveResult;
  }

  async update(
    channelInput: ChannelDto,
    channelId: string,
  ): Promise<ChannelEntity> {
    const channel = await this.findChannel(channelId, false);
    if (!channel) throw new NotFoundException();

    if (
      !channel.password &&
      channelInput.hasPassword &&
      !channelInput.password
    ) {
      throw new BadRequestException(
        'password needs to be set if hasPassword is true and no password is set yet',
      );
    }

    const input: any = {
      has_password: channelInput.hasPassword,
      is_public: channelInput.isPublic,
      title: channelInput.title,
    };

    if (input.has_password && channelInput.password) {
      input.password = await bcrypt.hash(
        channelInput.password,
        this.configService.get('saltRounds'),
      );
    } else if (input.has_password) {
      input.password = channel.password;
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
      channel.joined_users,
      updateResult,
    );
    return updateResult;
  }

  async remove(channel_id: string): Promise<{ id: string }> {
    const channel = await this.ChannelRepository.findOne({
      relations: ['joined_users'],
      where: { id: channel_id, type: ChannelTypes.TEXT },
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

  async findChannel(
    id: string,
    resolveUsers = true,
    type: ChannelTypes | null = ChannelTypes.TEXT,
  ): Promise<ChannelEntity> {
    const query: any = {
      id,
    };
    if (type !== null) query.type = type;
    const relations = ['joined_users'];
    if (resolveUsers) relations.push('joined_users.user');
    return await this.ChannelRepository.findOne({
      relations,
      where: query,
    });
  }

  async findDmChannel(user1: string, user2: string): Promise<ChannelEntity> {
    const dmId = (user1 > user2 ? [user2, user1] : [user1, user2]).join('=');
    return await this.ChannelRepository.findOne({
      relations: ['joined_users'],
      where: {
        dmId,
        type: ChannelTypes.DM,
      },
    });
  }

  findAllOfType(type: ChannelVisibility): Promise<IChannel[]> {
    const query: any = {
      where: {
        type: ChannelTypes.TEXT,
      },
    };
    if (type === 'public') query.where = { ...query.where, is_public: true };
    else if (type === 'private')
      query.where = { ...query.where, is_public: false };
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
      if (alreadyJoined.is_banned)
        throw new ForbiddenException(null, 'User is banned');
      await this.JoinedChannelRepository.save({
        id: alreadyJoined.id,
        is_joined: true,
      });
      alreadyJoined.is_joined = true;
      this.channelMessageService.sendJoinMessage(
        joinedChannelInput.channel,
        joinedChannelInput.user,
      );
      this.eventGateway.updateChannelUser(
        joinedChannelInput.channel,
        channel.joined_users,
        alreadyJoined,
      );
      return alreadyJoined;
    }

    // create new join
    const newUser = await this.JoinedChannelRepository.save({
      channel: joinedChannelInput.channel,
      user: joinedChannelInput.user,
    });
    await this.channelMessageService.sendJoinMessage(
      joinedChannelInput.channel,
      joinedChannelInput.user,
    );
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
    executingUser?: string,
  ): Promise<IJoinedChannel> {
    const channel = await this.findChannel(channelId);
    if (!channel) throw new NotFoundException();

    // cant punish owner, EVER
    if (channel.owner === user) throw new ForbiddenException();

    const q: any = {
      channel: channelId,
      user,
    };
    // if not the owner, you can only punish non-mods
    if (executingUser !== undefined && executingUser !== channel.owner)
      q.is_mod = false;
    let builder: any = this.JoinedChannelRepository.createQueryBuilder()
      .update()
      .where(q);

    let hasChanges = false;
    if (isMuted !== undefined) {
      hasChanges = true;
      let expiry: any = muteExpiry;
      if (expiry) expiry = new Date(Date.now() + expiry * 1000);
      else expiry = null;
      builder = builder.set({
        is_muted: isMuted,
        muted_expiry: expiry,
      });
    }
    if (isBanned !== undefined) {
      hasChanges = true;
      let expiry: any = banExpiry;
      if (expiry) expiry = new Date(Date.now() + expiry * 1000);
      else expiry = null;
      const obj: any = {
        is_banned: isBanned,
        ban_expiry: expiry,
      };

      // leave channel (doesnt send leave message) and remove mod
      if (isBanned) {
        obj.is_joined = false;
        obj.is_mod = false;
      }
      builder = builder.set(obj);
    }
    if (!hasChanges) throw new BadRequestException();
    builder = builder.returning('*');
    const res = await builder.execute().then((response) => {
      return <JoinedChannelEntity>response.raw[0];
    });

    if (!res) throw new NotFoundException();

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
      await this.channelMessageService.sendLeaveMessage(
        joinedChannelInput.channel,
        joinedChannelInput.user,
      );
      this.eventGateway.leaveChannelUser(
        joinedChannelInput.channel,
        channel.joined_users,
        joinedChannelInput.user,
      );
      return { id: joinedChannelInput.user };
    }

    await this.JoinedChannelRepository.delete(alreadyRemoved);
    await this.channelMessageService.sendLeaveMessage(
      joinedChannelInput.channel,
      joinedChannelInput.user,
    );
    this.eventGateway.leaveChannelUser(
      joinedChannelInput.channel,
      channel.joined_users,
      joinedChannelInput.user,
    );
    return { id: joinedChannelInput.user };
  }

  async listUsers(channelId: string): Promise<JoinedChannelEntity[]> {
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

  async makeOwner(
    channelId: string,
    newUserId: string,
  ): Promise<ChannelEntity> {
    const channel = await this.findChannel(channelId, false);
    if (!channel) throw new NotFoundException();

    if (!channel.joined_users.find((v) => v.user === newUserId))
      throw new NotFoundException(null, 'Cannot find user');

    const updateResult = await this.ChannelRepository.createQueryBuilder()
      .update()
      .set({
        owner: newUserId,
      })
      .where('id = :id', { id: channelId })
      .returning('*')
      .execute()
      .then((response) => {
        return <ChannelEntity>response.raw[0];
      });
    this.eventGateway.updateChannel(
      updateResult.id,
      channel.joined_users,
      updateResult,
    );
    return updateResult;
  }
}
