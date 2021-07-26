import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsEntity } from '@/friends.entity';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { UserModule } from '$/users/user.module';
import { EventModule } from '$/websocket/event.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendsEntity]),
    forwardRef(() => UserModule),
    forwardRef(() => EventModule),
  ],
  providers: [FriendsService],
  controllers: [FriendsController],
  exports: [FriendsService],
})
export class FriendsModule {}
