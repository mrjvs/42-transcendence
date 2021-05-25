import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelService } from './channel.service';
import { ChannelEntity } from './models/channel.entity';
import { JoinedChannelEntity } from './models/joined_channels.entity';
import { ChannelController } from './channel.controller';
import { MessageEntity } from './models/messages.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChannelEntity,
      JoinedChannelEntity,
      MessageEntity,
    ]),
  ],
  providers: [ChannelService],
  controllers: [ChannelController],
})
export class ChannelModule {}
