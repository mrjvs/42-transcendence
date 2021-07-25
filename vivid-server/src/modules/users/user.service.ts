import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { IUser, UserEntity } from '@/user.entity';
import { parse } from 'cookie';
import { getSessionStore } from '$/auth/auth-session';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { authenticator } from 'otplib';
import * as cryptoRandomString from 'secure-random-string';
import { TypeORMSession } from '@/session.entity';
import { encryptUserData } from './userEncrypt';

const colors = [
  '#29419F',
  '#A34FEC',
  '#E45655',
  '#A13754',
  '#4470C8',
  '#CFA93E',
];

function generateGradientColors(): string[] {
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  let otherColor;
  do {
    otherColor = colors[Math.floor(Math.random() * colors.length)];
  } while (otherColor === randomColor);
  return [randomColor, otherColor];
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private configService: ConfigService,
  ) {}

  // find user, optional resolving
  async findUser(
    id: string,
    resolves: string[] = [
      'joined_channels',
      'joined_channels.channel',
      'blocks',
    ],
  ): Promise<UserEntity> {
    return await this.userRepository
      .findOne({
        relations: resolves,
        where: {
          id,
        },
      })
      .catch((error) => {
        if (error.code === '22P02') throw new NotFoundException();
        throw error;
      });
  }

  // delete user, invalidates sessions and disconnects from websocket
  async deleteUser(id: string): Promise<void> {
    // TODO disconnect websocket connections
    // TODO leave guild, remove blocks, remove friends, leave channels
    await this.killSessions(id);
    await this.userRepository
      .createQueryBuilder()
      .delete()
      .where({ id: id })
      .returning('*')
      .execute()
      .then((response) => {
        return <UserEntity>response.raw[0];
      }); // TODO check empty result
  }

  async findUserMatches(id: string): Promise<UserEntity> {
    return await this.userRepository
      .findOne({
        relations: ['joined_channels', 'joined_channels.channel'],
        where: {
          id,
        },
      })
      .catch((error) => {
        if (error.code === '22P02') throw new NotFoundException();
        throw error;
      });
  }

  // invalidates sessions
  async killSessions(
    id: string,
    options: { except: string[] } = { except: [] },
  ): Promise<void> {
    let deleteBuilder: any = getRepository(TypeORMSession)
      .createQueryBuilder()
      .delete();

    // if has exceptions, run with NOT statement
    if (options.except.length > 0) {
      deleteBuilder = deleteBuilder.where(
        `regexp_replace(trim(both '"' from json::text), '\\\\"', '"', 'g')::json->'passport'->>'user' = :id AND NOT id IN (:...ids)`,
        {
          id,
          ids: options.except,
        },
      );
    }
    // else, run without session exceptions
    else {
      deleteBuilder = deleteBuilder.where(
        `regexp_replace(trim(both '"' from json::text), '\\\\"', '"', 'g')::json->'passport'->>'user' = :id`,
        {
          id,
        },
      );
    }
    return await deleteBuilder.execute();
  }

  // find by intra id
  async findIntraUser(id: string): Promise<UserEntity> {
    return await this.userRepository.findOne({
      where: {
        oauth_id: `intra-${id}`,
      },
    });
  }

  // find by discord id
  async findDiscordUser(id: string): Promise<UserEntity> {
    return await this.userRepository.findOne({
      where: {
        oauth_id: `discord-${id}`,
      },
    });
  }

  // create a new user
  async createUser(oauthId: string): Promise<UserEntity> {
    const user: IUser = {
      name: null,
      oauth_id: oauthId,
      avatar_colors: generateGradientColors(),
    };
    return await this.userRepository.save(user);
  }
  createDiscordUser(discordId: string): Promise<UserEntity> {
    return this.createUser(`discord-${discordId}`);
  }
  createIntraUser(intraId: string): Promise<UserEntity> {
    return this.createUser(`intra-${intraId}`);
  }

  // get user, parsed from cookie string
  async getUserIdFromCookie(cookie: string): Promise<string | null> {
    // parse cookie data
    if (!cookie) return null; // no cookies
    const parsedCookie = parse(cookie);
    const cookieData = parsedCookie[this.configService.get('cookie.name')];
    if (!cookieData) return null; // couldnt find auth cookie

    // parse signed cookie
    const signedId = cookieParser.signedCookie(
      cookieData,
      this.configService.get('secrets.session'),
    );
    if (!signedId) return null; // hash modified, untrustworthy

    // fetch session from database
    let sessionData;
    try {
      sessionData = await new Promise((resolve, reject) => {
        getSessionStore().get(signedId, (error?: any, result?: any) => {
          if (error) reject(error);
          if (!result) reject(new Error('Unknown token'));
          resolve(result);
        });
      });
    } catch (err) {
      return null;
    }

    // extract user from session data
    return sessionData?.passport?.user as string | null;
  }

  async enableTwoFactor(id: string, session?: any): Promise<any> {
    const data = {
      secret: authenticator.generateSecret(20), // 160 bytes, recommened totp length
      backupCodes: Array(12)
        .fill(0)
        .map(() =>
          cryptoRandomString({
            length: 6,
            alphanumeric: true,
          }).toUpperCase(),
        )
        .map((v) => `${v.slice(0, 3)}-${v.slice(3)}`),
    };
    const encryptedData = encryptUserData(
      id,
      this.configService.get('secrets.user'),
      data,
    );
    const result = await this.userRepository.update(id, {
      twofactor: encryptedData,
    });
    if (result.affected != 1) throw new NotFoundException();
    const exceptArray = [];
    if (session && session.id) exceptArray.push(session.id);
    this.killSessions(id, { except: exceptArray });
    return data;
  }

  async disableTwoFactor(id: string): Promise<void> {
    const result = await this.userRepository.update(id, {
      twofactor: null,
    });
    if (result.affected != 1) throw new NotFoundException();
  }

  async setTwoFactorData(id: string, data: any): Promise<void> {
    const encryptedData = encryptUserData(
      id,
      this.configService.get('secrets.user'),
      data,
    );
    const result = await this.userRepository.update(id, {
      twofactor: encryptedData,
    });
    if (result.affected != 1) throw new NotFoundException();
  }

  async updateName(userId: string, newName: string): Promise<any> {
    return await this.userRepository
      .save({
        id: userId,
        name: newName,
      })
      .catch((err) => {
        if (err.code === '23505')
          throw new BadRequestException({ code: 'inuse' });
        throw err;
      });
  }

  async updateAvatarName(userId: string, filename: string): Promise<any> {
    const res = await this.userRepository
      .createQueryBuilder()
      .update()
      .set({ avatar: filename })
      .where({ id: userId })
      .returning('*')
      .execute()
      .then((response) => {
        return <UserEntity>response.raw[0];
      });
    return {
      avatar: res.avatar,
    };
  }

  async deleteAvatar(userId: string): Promise<any> {
    const res = await this.userRepository
      .createQueryBuilder()
      .update()
      .set({ avatar: null })
      .where({ id: userId })
      .returning('*')
      .execute()
      .then((response) => {
        return <UserEntity>response.raw[0];
      });
    return {
      avatar: res.avatar,
    };
  }
}
