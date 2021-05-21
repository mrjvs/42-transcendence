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
        'f66ba8406b43d78a535da9c5e47c440f00c2d09f8b704c17391ba4b2a8bbaa4b',
      clientSecret:
        '25549075674c27959c27663e95faf11dd350b3d3c02e78c9bc5dd44cdb18af06',
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
