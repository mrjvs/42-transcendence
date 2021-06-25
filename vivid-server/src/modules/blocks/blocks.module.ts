import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlocksEntity } from '@/blocks.entity';
import { UserEntity } from '@/user.entity';
import { UserService } from '$/users/user.service';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';
import { GuildsService } from '../guilds/guilds.service';
import { GuildsEntity } from '~/models/guilds.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([BlocksEntity, UserEntity, GuildsEntity])],
  providers: [BlocksService, UserService, GuildsService, ConfigService],
  controllers: [BlocksController],
  exports: [BlocksService],
})
export class BlocksModule {}
