import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelEntity } from '@/channel.entity';
import { JoinedChannelEntity } from '@/joined_channels.entity';
import { EventGateway } from '$/websocket/event.gateway';

@Injectable()
export class ChannelTaskService {
  constructor(
    @InjectRepository(JoinedChannelEntity)
    private joinedChannelRepository: Repository<JoinedChannelEntity>,
    @InjectRepository(ChannelEntity)
    private channelRepository: Repository<ChannelEntity>,
    private readonly eventGateway: EventGateway,
  ) {}

  @Cron('*/5 * * * * *')
  async handleCron() {
    const unmuteResults = await this.joinedChannelRepository
      .createQueryBuilder()
      .update()
      .where(`muted_expiry IS NOT null AND muted_expiry < now()`)
      .set({
        is_muted: false,
        muted_expiry: null,
      })
      .returning('*')
      .execute();

    const unbanResults = await this.joinedChannelRepository
      .createQueryBuilder()
      .update()
      .where(`ban_expiry IS NOT null AND ban_expiry < now()`)
      .set({ is_banned: false, ban_expiry: null })
      .returning('*')
      .execute();

    if (unbanResults.affected > 0 || unmuteResults.affected > 0) {
      const joins = [...unbanResults.raw, ...unmuteResults.raw];
      const channelIds = joins.reduce((acc, val) => {
        const id = val.channel;
        if (!acc.includes(id)) acc.push(id);
        return acc;
      }, []);
      const channels: ChannelEntity[] = await this.channelRepository.findByIds(
        channelIds,
        {
          relations: ['joined_users'],
        },
      );
      channels.forEach((channel) => {
        const users: any[] = joins.reduce(
          (acc, v) => (v.channel === channel.id ? [...acc, v] : acc),
          [],
        );
        users.forEach((newUser) => {
          this.eventGateway.updateChannelUser(
            channel.id,
            channel.joined_users,
            newUser,
          );
        });
      });
    }
  }
}
