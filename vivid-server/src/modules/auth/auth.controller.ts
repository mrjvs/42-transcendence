import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { User } from '~/middleware/decorators/login.decorator';
import {
  AuthenticatedGuard,
  IntraAuthGuard,
} from '~/middleware/guards/auth.guards';
import { UserEntity } from '@/user.entity';

@Controller('auth')
export class AuthController {
  @Get('/login')
  @UseGuards(IntraAuthGuard)
  login(@Req() req): any {
    return {
      isLoggedIn: !!req.user,
    };
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
