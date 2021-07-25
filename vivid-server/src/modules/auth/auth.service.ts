import { Injectable, Inject } from '@nestjs/common';
import { UserService } from '$/users/user.service';
import { authenticator } from 'otplib';
import { UserEntity } from '@/user.entity';
import { decryptUserData } from '$/users/userEncrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UserService)
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async validateIntraSignin(intraId: string): Promise<any> {
    let user = await this.userService.findIntraUser(intraId);

    if (!user) {
      user = await this.userService.createIntraUser(intraId);
    }

    return user;
  }

  async validateDiscordSignin(discordId: string): Promise<any> {
    let user = await this.userService.findDiscordUser(discordId);

    if (!user) {
      user = await this.userService.createDiscordUser(discordId);
    }

    return user;
  }

  async passTwoFactor(session: any): Promise<any> {
    (session as any).twofactor = 'passed';
    await session.save();
  }

  async handleTwoFactor(
    session: any,
    usr: UserEntity,
    token?: string,
  ): Promise<boolean | string> {
    if (session.twofactor === 'passed') return true;

    if (!usr.hasTwoFactorEnabled()) {
      await this.passTwoFactor(session);
      return true;
    }

    // check if token exists
    if (!token) {
      return 'requireToken';
    }

    // verify token
    const decryptedTwoFactorData = decryptUserData(
      usr.id,
      this.configService.get('secrets.user'),
      usr.twofactor,
    );
    const tokenCorrect = authenticator.verify({
      token: token,
      secret: decryptedTwoFactorData.secret,
    });
    const isInBackupCodes = !!decryptedTwoFactorData.backupCodes.find(
      (v) => v === token,
    );
    if (!tokenCorrect && !isInBackupCodes) {
      return 'invalidToken';
    }

    if (isInBackupCodes) {
      const data = JSON.parse(JSON.stringify(decryptedTwoFactorData)); // deep copy
      data.backupCodes = data.backupCodes.filter(
        (code: string) => code !== token,
      );
      await this.userService.setTwoFactorData(usr.id, data);
    }

    // success
    await this.passTwoFactor(session);
    return true;
  }
}
