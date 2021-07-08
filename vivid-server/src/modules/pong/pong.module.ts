import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildsEntity } from '~/models/guilds.entity';
import { MatchesEntity } from '~/models/matches.entity';
import { UserEntity } from '~/models/user.entity';
import { GuildsService } from '../guilds/guilds.service';
import { MatchesService } from '../matches/matches.service';
import { UserService } from '../users/user.service';
import { PongService } from './pong.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, GuildsEntity, MatchesEntity]),
  ],
  controllers: [],
  providers: [
    PongService,
    UserService,
    ConfigService,
    GuildsService,
    MatchesService,
  ],
  exports: [PongService],
})
export class PongModule {}
