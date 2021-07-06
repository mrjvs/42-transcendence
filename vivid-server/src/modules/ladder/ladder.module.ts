import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LadderEntity } from '@/ladder.entity';
import { LadderService } from '$/ladder/ladder.service';
import { LadderController } from '$/ladder/ladder.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LadderEntity])],
  providers: [LadderService],
  controllers: [LadderController],
})
export class LadderModule {}
