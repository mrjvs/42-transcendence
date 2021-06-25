import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsEntity } from '@/friends.entity';
import { UserEntity } from '@/user.entity';
import { UserService } from '$/users/user.service';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { GuildsService } from '../guilds/guilds.service';
import { GuildsEntity } from '~/models/guilds.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendsEntity, UserEntity, GuildsEntity]),
  ],
  providers: [FriendsService, UserService, GuildsService, ConfigService],
  controllers: [FriendsController],
  exports: [FriendsService],
})
export class FriendsModule {}
