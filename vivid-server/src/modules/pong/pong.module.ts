import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/user.entity';
import { LadderModule } from '$/ladder/ladder.module';
import { MatchesModule } from '$/matches/matches.module';
import { UserModule } from '$/users/user.module';
import { PongService } from './pong.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    forwardRef(() => MatchesModule),
    forwardRef(() => UserModule),
    forwardRef(() => LadderModule),
  ],
  controllers: [],
  providers: [PongService],
  exports: [PongService],
})
export class PongModule {}
