import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/user.entity';
import { UserService } from '$/users/user.service';
import { GuildsController } from './guilds.controller';
import { GuildsService } from './guilds.service';
import { GuildsEntity } from '@/guilds.entity';
import { WarsService } from '../wars/wars.service';
import { WarEntity } from '~/models/war.entity';
import { WarTimeEntity } from '~/models/war_time.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GuildsEntity,
      UserEntity,
      WarEntity,
      WarTimeEntity,
    ]),
  ],
  providers: [GuildsService, UserService, WarsService, ConfigService],
  controllers: [GuildsController],
  exports: [GuildsService],
})
export class GuildsModule {}
