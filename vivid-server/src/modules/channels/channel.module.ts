import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelService } from './channel.service';
import { ChannelEntity } from '@/channel.entity';
import { JoinedChannelEntity } from '@/joined_channels.entity';
import { ChannelController } from './channel.controller';
import { ChannelUserController } from './channel.user.controller';
import { ChannelMessageController } from './channel.message.controller';
import { MessageEntity } from '@/messages.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChannelEntity,
      JoinedChannelEntity,
      MessageEntity,
    ]),
  ],
  providers: [ChannelService],
  controllers: [
    ChannelController,
    ChannelUserController,
    ChannelMessageController,
  ],
})
export class ChannelModule {}
