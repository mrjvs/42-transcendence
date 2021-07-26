import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserEntity } from '@/user.entity';
import { UserController } from './user.controller';
import { ConfigService } from '@nestjs/config';
import { UserSetupController } from './user_setup.controller';
import { MatchesModule } from '$/matches/matches.module';
import { JoinedChannelEntity } from '@/joined_channels.entity';
import { FriendsEntity } from '@/friends.entity';
import { EventModule } from '../websocket/event.module';
import { ChannelEntity } from '@/channel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      JoinedChannelEntity,
      FriendsEntity,
      ChannelEntity,
    ]),
    MatchesModule,
    EventModule,
  ],
  providers: [UserService, ConfigService],
  controllers: [UserController, UserSetupController],
  exports: [UserService],
})
export class UserModule {}
