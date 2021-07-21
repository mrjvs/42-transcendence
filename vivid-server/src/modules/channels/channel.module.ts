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
import { EventModule } from '../websocket/event.module';
import { PongModule } from '../pong/pong.module';

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
  ],
  providers: [ChannelService, ChannelMessageService, ConfigService],
  controllers: [
    ChannelController,
    ChannelUserController,
    ChannelMessageController,
  ],
})
export class ChannelModule {}
