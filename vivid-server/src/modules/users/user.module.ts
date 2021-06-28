import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserEntity } from '@/user.entity';
import { UserController } from './user.controller';
import { ConfigService } from '@nestjs/config';
import { GuildsEntity } from '@/guilds.entity';
import { GuildsService } from '$/guilds/guilds.service';
import { UserSetupController } from './user_setup.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, GuildsEntity])],
  providers: [UserService, ConfigService, GuildsService],
  controllers: [UserController, UserSetupController],
  exports: [UserService],
})
export class UserModule {}
