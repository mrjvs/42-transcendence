import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedGuard, IntraAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  @Get('/login')
  @UseGuards(IntraAuthGuard)
  login(@Req() req): object {
    return {
      isLoggedIn: !!req.user,
    };
  }

  @Get('/me')
  @UseGuards(AuthenticatedGuard)
  getUser(@Req() req: Request): object {
    return {
      user: req.user,
    };
  }
}
