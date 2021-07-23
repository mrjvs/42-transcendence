import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsEntity } from '@/friends.entity';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { UserModule } from '../users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendsEntity]),
    forwardRef(() => UserModule),
  ],
  providers: [FriendsService],
  controllers: [FriendsController],
  exports: [FriendsService],
})
export class FriendsModule {}
