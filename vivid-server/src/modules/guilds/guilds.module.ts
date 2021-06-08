import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsEntity } from '@/friends.entity';
import { UserEntity } from '@/user.entity';
import { FriendsService } from '$/friends/friends.service';
import { UserService } from '$/users/user.service';
import { GuildsController } from './guilds.controller';
import { GuildsService } from './guilds.service';
import { GuildsEntity } from '~/models/guilds.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GuildsEntity, UserEntity])],
  providers: [GuildsService, UserService],
  controllers: [GuildsController],
  exports: [GuildsService],
})
export class GuildsModule {}
