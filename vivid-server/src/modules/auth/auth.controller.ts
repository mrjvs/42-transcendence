import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { User } from '~/middleware/decorators/login.decorator';
import {
  AuthenticatedGuard,
  IntraAuthGuard,
} from '~/middleware/guards/auth.guards';
import { UserEntity } from '@/user.entity';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(private configService: ConfigService) {}

  @Get('/login')
  @UseGuards(IntraAuthGuard)
  login(@Res() res): any {
    res.redirect(this.configService.get('oauth.redirect'));
  }

  @Get('/me')
  @UseGuards(AuthenticatedGuard)
  getUser(@User() user: UserEntity): any {
    return {
      user: user,
      name: user.getName(),
    };
  }
}
