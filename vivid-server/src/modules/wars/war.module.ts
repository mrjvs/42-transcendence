import { Module } from '@nestjs/common';
import { WarEntity } from '@/war.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarService } from './war.service';
import { WarController } from './war.controller';
import { WarTimeEntity } from '@/war_time.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WarEntity, WarTimeEntity])],
  providers: [WarService],
  controllers: [WarController],
  exports: [WarService],
})
export class WarModule {}
