import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelEntity } from '@/channel.entity';
import { JoinedChannelEntity } from '@/joined_channels.entity';
import { MatchesEntity } from '@/matches.entity';
import { TypeORMSession } from '@/session.entity';
import { UserEntity } from '@/user.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(JoinedChannelEntity)
    private joinedChannelsRepository: Repository<JoinedChannelEntity>,
    @InjectRepository(MatchesEntity)
    private matchesRepository: Repository<MatchesEntity>,
    @InjectRepository(TypeORMSession)
    private sessionRepository: Repository<TypeORMSession>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(ChannelEntity)
    private channelsRepository: Repository<ChannelEntity>,
  ) {}

  async userMessagesCount(userId: string): Promise<string> {
    const result = await this.joinedChannelsRepository.query(
      `select count(*) from messages inner join joined_channels on joined_channels.user=messages.user and joined_channels.channel=messages.channel where joined_channels.user = $1`,
      [userId],
    );
    return result[0].count;
  }

  async userSecretCount(userId: string): Promise<string> {
    const result = await this.joinedChannelsRepository.query(
      `select count(*) from messages inner join joined_channels on joined_channels.user=messages.user and joined_channels.channel=messages.channel where joined_channels.user = $1 and messages.message_type = 42`,
      [userId],
    );
    return result[0].count;
  }

  async userLoginCount(userId: string): Promise<number> {
    const result = await this.sessionRepository.find();
    const parsedResults = result.map((v) => JSON.parse(v.json));
    const filtered = parsedResults.filter((v) => v?.passport?.user === userId);
    return filtered.length;
  }

  async matchesCount(): Promise<string> {
    const result = await this.matchesRepository.query(
      `select count(*) from matches`,
    );
    return result[0].count;
  }

  async usersCount(): Promise<string> {
    const result = await this.usersRepository.query(
      `select count(*) from users`,
    );
    return result[0].count;
  }

  async channelsCount(): Promise<string> {
    const result = await this.channelsRepository.query(
      `select count(*) from channels where is_public = true`,
    );
    return result[0].count;
  }

  async messagesCount(): Promise<string> {
    const result = await this.joinedChannelsRepository.query(
      `select count(*) from messages`,
    );
    return result[0].count;
  }

  async twoFaCount(): Promise<string> {
    const result = await this.usersRepository.query(
      `select count(*) from users where twofactor is not null`,
    );
    return result[0].count;
  }
}
