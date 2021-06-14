import { Module } from '@nestjs/common';
import { WarEntity } from '@/war.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarsService } from './wars.service';
import { WarsController } from './wars.controller';
import { WarTimeEntity } from '@/war_time.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WarEntity, WarTimeEntity])],
  providers: [WarsService],
  controllers: [WarsController],
  exports: [WarsService],
})
export class WarsModule {}
