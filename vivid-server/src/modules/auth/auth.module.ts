import { HttpModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '$/users/user.module';
import { AuthController } from './auth.controller';
import { SessionSerializer } from './auth.serialize';
import { AuthService } from './auth.service';
import { IntraStrategy } from './intra.strategy';
import { DiscordStrategy } from './discord.strategy';

/*
AUTH FLOW:
1. Make get request to /api/v1/auth/login/<TYPE> and follow redirect
2. authorize application to account
3. Make post request to /api/v1/auth/twofactor
3.1 if not success, ask client for 2fa token and redo request
4. now logged in
*/
@Module({
  controllers: [AuthController],
  providers: [
    IntraStrategy,
    DiscordStrategy,
    SessionSerializer,
    AuthService,
    ConfigService,
  ],
  imports: [UserModule, HttpModule],
  exports: [AuthService],
})
export class AuthModule {}
