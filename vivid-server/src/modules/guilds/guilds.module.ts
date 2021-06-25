import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/user.entity';
import { UserService } from '$/users/user.service';
import { GuildsController } from './guilds.controller';
import { GuildsService } from './guilds.service';
import { GuildsEntity } from '@/guilds.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([GuildsEntity, UserEntity])],
  providers: [GuildsService, UserService, ConfigService],
  controllers: [GuildsController],
  exports: [GuildsService],
})
export class GuildsModule {}
