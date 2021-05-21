import { Strategy } from 'passport-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { HttpService, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class intraStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private httpService: HttpService,
  ) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID:
        '',
      clientSecret:
        '',
      callbackURL: 'http://localhost:8080/api/v1/auth/login',
      scopes: ['public']
    });
  }

  async validate(accessToken: string): Promise<any> {
      console.log("token", accessToken);
    const { data } = await this.httpService
      .get('https://api.intra.42.fr/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .toPromise();

    const prom = await this.authService.findUserFromIntraId(data.id);
    console.log("user", prom);
    return prom;
  }
}
