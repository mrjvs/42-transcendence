import { Strategy } from 'passport-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { HttpService, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordStrategy extends PassportStrategy(
  Strategy,
  'discord-oauth',
) {
  constructor(
    private authService: AuthService,
    private httpService: HttpService,
    configService: ConfigService,
  ) {
    super({
      authorizationURL: 'https://discordapp.com/api/oauth2/authorize',
      tokenURL: 'https://discord.com/api/oauth2/token',
      clientID: configService.get('oauth.discord.clientId'),
      clientSecret: configService.get('oauth.discord.clientSecret'),
      callbackURL:
        configService.get('oauth.callbackHost') + '/api/v1/auth/login/discord',
      scope: 'identify',
    });
  }

  async validate(accessToken: string): Promise<any> {
    const { data } = await this.httpService
      .get('https://discord.com/api/oauth2/@me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .toPromise();
    return await this.authService.validateDiscordSignin(data.user.id);
  }
}
