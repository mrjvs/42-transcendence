import { Strategy } from 'passport-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { HttpService, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IntraStrategy extends PassportStrategy(Strategy, 'intra-oauth') {
  constructor(
    private authService: AuthService,
    private httpService: HttpService,
    configService: ConfigService,
  ) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: configService.get('oauth.intra.clientId'),
      clientSecret: configService.get('oauth.intra.clientSecret'),
      callbackURL:
        configService.get('oauth.callbackHost') + '/api/v1/auth/login/intra',
    });
  }

  async validate(accessToken: string): Promise<any> {
    const { data } = await this.httpService
      .get('https://api.intra.42.fr/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .toPromise();
    return await this.authService.validateIntraSignin(data.id);
  }
}
