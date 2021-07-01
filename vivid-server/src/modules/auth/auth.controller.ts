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
import { IntraAuthGuard, No2faGuard } from '~/middleware/guards/auth.guards';
import { UserEntity } from '@/user.entity';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IsOptional, IsString } from 'class-validator';
import { authenticator } from 'otplib';


class TwoFactorDto {
  @IsOptional()
  @IsString()
  token?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private configService: ConfigService) {}

  @Get('/login')
  @UseGuards(IntraAuthGuard)
  login(@Res() res): any {
    res.redirect(this.configService.get('oauth.redirect'));
  }

  @Post('/2fa')
  @UseGuards(No2faGuard)
  async twofactor(
    @Req() req: Request,
    @User() usr: UserEntity,
    @Body() body: TwoFactorDto,
  ): Promise<{ status: boolean; message?: string }> {
    // if already passed, return true
    if ((req.session as any).twofactor === 'passed') {
      return {
        status: true,
      };
    }

    // if 2fa not enabled. pass check immediately
    if (!usr.hasTwoFactorEnabled()) {
      (req.session as any).twofactor = 'passed';
      await req.session.save();
      return {
        status: true,
      };
    }

    // check if token exists
    if (!body.token) {
      return {
        status: false,
        message: 'requireToken',
      };
    }

    // verify token
    const tokenCorrect = authenticator.verify({
      token: body.token,
      secret: usr.twofactor.secret,
    });
    const isInBackupCodes = !!usr.twofactor.backupCodes.find(
      (v) => v === body.token,
    );
    if (!tokenCorrect && !isInBackupCodes) {
      return {
        status: false,
        message: 'invalidToken',
      };
    }

    if (isInBackupCodes) {
      // TODO remove code from backup codes
    }

    // success
    (req.session as any).twofactor = 'passed';
    await req.session.save();
    return {
      status: true,
    };
  }
}
