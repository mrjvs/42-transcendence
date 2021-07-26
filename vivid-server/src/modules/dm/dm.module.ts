import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JoinedChannelEntity } from '@/joined_channels.entity';
import { ConfigService } from '@nestjs/config';
import { DmService } from './dm.service';
import { DmController } from './dm.controller';
import { ChannelModule } from '$/channels/channel.module';
import { FriendsModule } from '$/friends/friends.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JoinedChannelEntity]),
    ChannelModule,
    FriendsModule,
  ],
  providers: [DmService, ConfigService],
  controllers: [DmController],
})
export class DmModule {}
