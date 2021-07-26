import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { User } from '~/middleware/decorators/login.decorator';
import {
  IntraAuthGuard,
  No2faGuard,
  DiscordAuthGuard,
} from '~/middleware/guards/auth.guards';
import { UserEntity } from '@/user.entity';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IsOptional, IsString } from 'class-validator';
import { AuthService } from './auth.service';

class TwoFactorDto {
  @IsOptional()
  @IsString()
  token?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {}

  @Get('/login/intra')
  @UseGuards(IntraAuthGuard)
  loginIntra(@Res() res): any {
    res.redirect(this.configService.get('oauth.redirect'));
  }

  @Get('/login/discord')
  @UseGuards(DiscordAuthGuard)
  loginDiscord(@Res() res): any {
    res.redirect(this.configService.get('oauth.redirect'));
  }

  @Post('/logout')
  async logout(@Req() req: Request): Promise<void> {
    if (!req.session) return;
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  @Post('/2fa')
  @UseGuards(No2faGuard)
  async twofactor(
    @Req() req: Request,
    @User() usr: UserEntity,
    @Body() body: TwoFactorDto,
  ): Promise<{ status: boolean; message?: string }> {
    const res = await this.authService.handleTwoFactor(
      req.session,
      usr,
      body.token,
    );
    if (res.constructor === String)
      return {
        status: false,
        message: res as string,
      };
    return {
      status: true,
    };
  }
}
