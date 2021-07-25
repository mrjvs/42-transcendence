import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LadderEntity } from '@/ladder.entity';
import { LadderService } from '$/ladder/ladder.service';
import { LadderController } from '$/ladder/ladder.controller';
import { MatchMakingService } from './matchmaking.service';
import { PongModule } from '$/pong/pong.module';
import { LadderUserEntity } from '@/ladder_user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LadderEntity, LadderUserEntity]),
    forwardRef(() => PongModule),
  ],
  providers: [LadderService, MatchMakingService],
  controllers: [LadderController],
  exports: [MatchMakingService, LadderService],
})
export class LadderModule {}
