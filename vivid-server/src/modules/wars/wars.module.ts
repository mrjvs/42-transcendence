import { Module } from '@nestjs/common';
import { WarsEntity } from '@/wars.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarsService } from './wars.service';
import { WarsController } from './wars.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WarsEntity])],
  providers: [WarsService],
  controllers: [WarsController],
  exports: [WarsService],
})
export class WarsModule {}
