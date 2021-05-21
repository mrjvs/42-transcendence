import { HttpModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/users/user.module';
import { AuthController } from './auth.controller';
import { SessionSerializer } from './auth.serialize';
import { AuthService } from './auth.service';
import { intraStrategy } from './intra.strategy';

@Module({
  controllers: [AuthController],
  providers: [intraStrategy, SessionSerializer, AuthService],
  imports: [
    UserModule,
    HttpModule,
    PassportModule.register({
      session: true,
    }),
  ],
  exports: [
    intraStrategy, PassportModule, SessionSerializer, AuthService
  ]
})
export class AuthModule {}
