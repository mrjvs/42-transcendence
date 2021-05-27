import { HttpModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '$/users/user.module';
import { AuthController } from './auth.controller';
import { SessionSerializer } from './auth.serialize';
import { AuthService } from './auth.service';
import { IntraStrategy } from './intra.strategy';

@Module({
  controllers: [AuthController],
  providers: [IntraStrategy, SessionSerializer, AuthService, ConfigService],
  imports: [UserModule, HttpModule],
  exports: [AuthService],
})
export class AuthModule {}
