import { Module } from '@nestjs/common';
import { WarsEntity } from '@/wars.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarsService } from './wars.service';
import { WarsController } from './wars.controller';
import { GuildsService } from '../guilds/guilds.service';
import { GuildsEntity } from '@/guilds.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WarsEntity, GuildsEntity])],
  providers: [WarsService, GuildsService],
  controllers: [WarsController],
  exports: [WarsService],
})
export class WarsModule {}
