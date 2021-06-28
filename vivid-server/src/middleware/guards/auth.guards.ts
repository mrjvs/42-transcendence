import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from '~/models/user.entity';

@Injectable()
export class IntraAuthGuard extends AuthGuard('oauth2') {
  async canActivate(context: ExecutionContext) {
    const activate = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return activate;
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
