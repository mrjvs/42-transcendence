import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelEntity } from '@/channel.entity';
import { JoinedChannelEntity } from '@/joined_channels.entity';
import { MatchesEntity } from '@/matches.entity';
import { MessageEntity } from '@/messages.entity';
import { TypeORMSession } from '@/session.entity';
import { UserEntity } from '@/user.entity';
import { MatchesModule } from '$/matches/matches.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JoinedChannelEntity,
      MessageEntity,
      MatchesEntity,
      UserEntity,
      ChannelEntity,
      TypeORMSession,
    ]),
    forwardRef(() => MatchesModule),
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
