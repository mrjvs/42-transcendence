import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserEntity } from '@/user.entity';
import { UserController } from './user.controller';
import { ConfigService } from '@nestjs/config';
import { GuildsEntity } from '@/guilds.entity';
import { GuildsService } from '$/guilds/guilds.service';
import { MatchesEntity } from '~/models/matches.entity';
import { MatchesService } from '../matches/matches.service';
import { MatchesController } from '../matches/matches.controller';
import { WarEntity } from '~/models/war.entity';
import { WarsService } from '../wars/wars.service';
import { WarTimeEntity } from '~/models/war_time.entity';
import { UserSetupController } from './user_setup.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, GuildsEntity, MatchesEntity, WarEntity, WarTimeEntity])],
  providers: [UserService, GuildsService, MatchesService, WarsService, ConfigService],
  controllers: [UserController, MatchesController, UserSetupController],
  exports: [UserService],
})
export class UserModule {}
