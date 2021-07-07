import { Module } from '@nestjs/common';
import { UserModule } from '$/users/user.module';
import { EventGateway } from './event.gateway';
import { PongModule } from '$/pong/pong.module';

@Module({
  imports: [UserModule, PongModule],
  providers: [EventGateway],
  exports: [EventGateway],
})
export class EventModule {}
