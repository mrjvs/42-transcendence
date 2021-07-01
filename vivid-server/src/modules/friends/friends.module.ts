import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsEntity } from '@/friends.entity';
import { UserEntity } from '@/user.entity';
import { UserService } from '$/users/user.service';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { GuildsService } from '../guilds/guilds.service';
import { GuildsEntity } from '~/models/guilds.entity';
import { WarsService } from '../wars/wars.service';
import { WarEntity } from '~/models/war.entity';
import { WarTimeEntity } from '~/models/war_time.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendsEntity, UserEntity, GuildsEntity, WarEntity, WarTimeEntity]),
  ],
  providers: [FriendsService, UserService, GuildsService, WarsService, ConfigService],
  controllers: [FriendsController],
  exports: [FriendsService],
})
export class FriendsModule {}
