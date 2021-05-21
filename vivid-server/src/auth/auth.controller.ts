import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  @Get('/login')
  @UseGuards(AuthGuard('oauth2'))
  login(@Req() req): object {
    return {
      isLoggedIn: !!req.user,
    };
  }

  @Get('/me')
  getUser(@Req() req): object {
    return {
      user: req.user,
    };
  }
}
