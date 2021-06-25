import { Module } from '@nestjs/common';
import { UserModule } from '$/users/user.module';
import { EventGateway } from './event.gateway';

@Module({
  imports: [UserModule],
  providers: [EventGateway],
  exports: [EventGateway],
})
export class EventModule {}
