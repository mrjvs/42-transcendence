import { Module } from '@nestjs/common';
import { PongService } from './pong.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PongService],
  exports: [PongService],
})
export class PongModule {}
