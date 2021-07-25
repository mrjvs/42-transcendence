import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '$/users/user.module';
import { EventGateway } from './event.gateway';
import { PongModule } from '$/pong/pong.module';
import { LadderModule } from '$/ladder/ladder.module';

@Module({
  imports: [forwardRef(() => UserModule), PongModule, LadderModule],
  providers: [EventGateway],
  exports: [EventGateway],
})
export class EventModule {}
