import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildsEntity } from '~/models/guilds.entity';
import { MatchesEntity } from '~/models/matches.entity';
import { UserEntity } from '~/models/user.entity';
import { GuildsController } from '../guilds/guilds.controller';
import { GuildsService } from '../guilds/guilds.service';
import { UserController } from '../users/user.controller';
import { UserService } from '../users/user.service';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
  imports: [TypeOrmModule.forFeature([MatchesEntity, UserEntity, GuildsEntity])],
  controllers: [MatchesController, UserController, GuildsController],
  providers: [MatchesService, UserService, GuildsService],
  exports: [MatchesService]
})
export class MatchesModule {}
