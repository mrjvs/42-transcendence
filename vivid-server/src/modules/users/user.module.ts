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

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, GuildsEntity, MatchesEntity]),
  ],
  providers: [UserService, GuildsService, MatchesService, ConfigService],
  controllers: [UserController, MatchesController],
  exports: [UserService],
})
export class UserModule {}
