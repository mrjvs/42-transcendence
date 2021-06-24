import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserEntity } from '@/user.entity';
import { UserController } from './user.controller';
import { ConfigService } from '@nestjs/config';
import { GuildsEntity } from '@/guilds.entity';
import { GuildsService } from '$/guilds/guilds.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, GuildsEntity])],
  providers: [UserService, ConfigService, GuildsService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
