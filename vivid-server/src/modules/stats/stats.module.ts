import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelEntity } from '~/models/channel.entity';
import { JoinedChannelEntity } from '~/models/joined_channels.entity';
import { MatchesEntity } from '~/models/matches.entity';
import { MessageEntity } from '~/models/messages.entity';
import { TypeORMSession } from '~/models/session.entity';
import { UserEntity } from '~/models/user.entity';
import { MatchesModule } from '../matches/matches.module';
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
