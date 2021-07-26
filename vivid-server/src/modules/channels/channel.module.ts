import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelService } from './channel.service';
import { ChannelMessageService } from './channel.message.service';
import { ChannelEntity } from '@/channel.entity';
import { JoinedChannelEntity } from '@/joined_channels.entity';
import { ChannelController } from './channel.controller';
import { ChannelUserController } from './channel.user.controller';
import { ChannelMessageController } from './channel.message.controller';
import { MessageEntity } from '@/messages.entity';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '$/users/user.module';
import { EventModule } from '$/websocket/event.module';
import { PongModule } from '$/pong/pong.module';
import { FriendsModule } from '$/friends/friends.module';
import { ChannelTaskService } from './channel.cron.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChannelEntity,
      JoinedChannelEntity,
      MessageEntity,
    ]),
    UserModule,
    EventModule,
    PongModule,
    FriendsModule,
  ],
  providers: [
    ChannelService,
    ChannelTaskService,
    ChannelMessageService,
    ConfigService,
  ],
  controllers: [
    ChannelController,
    ChannelUserController,
    ChannelMessageController,
  ],
  exports: [ChannelService],
})
export class ChannelModule {}
