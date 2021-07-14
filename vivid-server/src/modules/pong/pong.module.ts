import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '~/models/user.entity';
import { MatchesModule } from '../matches/matches.module';
import { PongService } from './pong.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    forwardRef(() => MatchesModule),
  ],
  controllers: [],
  providers: [PongService],
  exports: [PongService],
})
export class PongModule {}
