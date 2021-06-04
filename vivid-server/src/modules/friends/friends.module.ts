import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsEntity } from '@/friends.entity';
import { UserEntity } from '@/user.entity';
import { UserService } from '../users/user.service';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
  imports: [TypeOrmModule.forFeature([FriendsEntity, UserEntity])],
  providers: [FriendsService, UserService],
  controllers: [FriendsController],
  exports: [FriendsService],
})
export class FriendsModule {}
