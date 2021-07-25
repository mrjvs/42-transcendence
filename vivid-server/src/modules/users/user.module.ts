import { forwardRef, Module } from '@nestjs/common';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, JoinedChannelEntity, FriendsEntity]),
    MatchesModule,
    EventModule,
  ],
  providers: [UserService, ConfigService],
  controllers: [UserController, UserSetupController],
  exports: [UserService],
})
export class UserModule {}
