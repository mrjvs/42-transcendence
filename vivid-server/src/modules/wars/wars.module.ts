import { Module } from '@nestjs/common';
import { WarEntity } from '@/war.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarsService } from './wars.service';
import { WarsController } from './wars.controller';
import { WarTimeEntity } from '@/war_time.entity';
import { GuildsEntity } from '@/guilds.entity';
import { GuildsService } from '$/guilds/guilds.service';

@Module({
  imports: [TypeOrmModule.forFeature([WarEntity, WarTimeEntity, GuildsEntity])],
  providers: [WarsService, GuildsService],
  controllers: [WarsController],
  exports: [WarsService],
})
export class WarsModule {}
