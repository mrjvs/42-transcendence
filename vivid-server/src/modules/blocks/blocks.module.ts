import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlocksEntity } from '@/blocks.entity';
import { UserEntity } from '@/user.entity';
import { UserService } from '$/users/user.service';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';
import { GuildsService } from '../guilds/guilds.service';
import { GuildsEntity } from '~/models/guilds.entity';
import { WarTimeEntity } from '~/models/war_time.entity';
import { WarEntity } from '~/models/war.entity';
import { WarsService } from '../wars/wars.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([BlocksEntity, UserEntity, GuildsEntity, WarTimeEntity, WarEntity])],
  providers: [BlocksService, UserService, GuildsService, WarsService, ConfigService],
  controllers: [BlocksController],
  exports: [BlocksService],
})
export class BlocksModule {}
