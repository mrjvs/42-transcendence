import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from '@/user.entity';

@Injectable()
export class IntraAuthGuard extends AuthGuard('intra-oauth') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  get shouldAllow() {
    return this.configService.get('oauth.intra.enabled');
  }

  async canActivate(context: ExecutionContext) {
    if (!this.shouldAllow)
      throw new ForbiddenException(null, 'Auth not enabled for this method');
    const activate = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return activate;
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new HttpException('failed to login', err.status);
    }
    return user;
  }
}

@Injectable()
export class DiscordAuthGuard extends AuthGuard('discord-oauth') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  get shouldAllow() {
    return this.configService.get('oauth.discord.enabled');
  }

  async canActivate(context: ExecutionContext) {
    if (!this.shouldAllow)
      throw new ForbiddenException(null, 'Auth not enabled for this method');
    const activate = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return activate;
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new HttpException('failed to login', err.status);
    }
    return user;
  }
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    // check if has session
    if (!req.isAuthenticated()) throw new UnauthorizedException();
    // check if two factor
    if (req.session.twofactor !== 'passed') throw new UnauthorizedException();
    // check if account is fully setup
    const user: UserEntity = req.user;
    if (!user.isAccountSetup()) return false;
    return true;
  }
}

@Injectable()
export class No2faGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (!req.isAuthenticated()) throw new UnauthorizedException();
    return true;
  }
}

@Injectable()
export class AccountNotSetupGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (!req.isAuthenticated()) throw new UnauthorizedException();
    if (req.session.twofactor !== 'passed') throw new UnauthorizedException();
    return true;
  }
}
