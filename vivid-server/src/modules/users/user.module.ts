import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserEntity } from '@/user.entity';
import { UserController } from './user.controller';
import { ConfigService } from '@nestjs/config';
import { UserSetupController } from './user_setup.controller';
import { MatchesModule } from '$/matches/matches.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), MatchesModule],
  providers: [UserService, ConfigService],
  controllers: [UserController, UserSetupController],
  exports: [UserService],
})
export class UserModule {}
