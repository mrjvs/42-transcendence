import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelEntity } from '~/models/channel.entity';
import { JoinedChannelEntity } from '~/models/joined_channels.entity';
import { ChannelService } from '$/channels/channel.service';
import { FriendsService } from '$/friends/friends.service';

@Injectable()
export class DmService {
  constructor(
    private channelService: ChannelService,
    @InjectRepository(JoinedChannelEntity)
    private joinedChannelsRepository: Repository<JoinedChannelEntity>,
    private friendService: FriendsService,
  ) {}

  async getDM(user1: string, user2: string): Promise<ChannelEntity> {
    const friendship = await this.friendService.getFriend(user1, user2);
    if (!friendship) throw new ForbiddenException();

    const channel = await this.channelService.findDmChannel(user1, user2);

    // friend dm doesnt exist, create one
    if (!channel) {
      return await this.channelService.addDmChannel(user1, user2);
    }

    // correct joins (if not joined, join them back)
    const u1 = channel.joined_users.find((v) => v.user === user1);
    const u2 = channel.joined_users.find((v) => v.user === user2);
    if (!u1) {
      await this.joinedChannelsRepository.save({
        user: user1,
        channel: channel.id,
        is_joined: true,
      });
    }
    if (!u2) {
      await this.joinedChannelsRepository.save({
        user: user2,
        channel: channel.id,
        is_joined: true,
      });
    }

    return channel;
  }
}
