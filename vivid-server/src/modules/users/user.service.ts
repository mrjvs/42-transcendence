import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from } from 'rxjs';
import { Repository } from 'typeorm';
import { UserEntity } from '@/user.entity';
import { IUser } from '@/user.interface';
import { parse } from 'cookie';
import { getSessionStore } from '$/auth/auth-session';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { GuildsService } from '$/guilds/guilds.service';
import { IMatch } from '~/models/match.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private configService: ConfigService,
    private guildsService: GuildsService,
  ) {}

  add(user: IUser): Observable<IUser> {
    return from(this.userRepository.save(user));
  }

  async findUser(id: string): Promise<UserEntity> {
    return await this.userRepository
      .findOne({
        relations: [
          'joined_channels',
          'joined_channels.channel',
          'guild',
          'guild.users',
        ],
        where: {
          id,
        },
      })
      .catch((error) => {
        if (error.code === '22P02') throw new NotFoundException();
        throw error;
      });
  }

  async findUserMatches(id: string): Promise<UserEntity> {
    return await this.userRepository
      .findOne({
        relations: [
          'joined_channels',
          'joined_channels.channel',
          'guild',
          'guild.users',
          'matches_req',
          'matches_req.user_req',
          'matches_req.user_acpt',
          'matches_acpt',
          'matches_acpt.user_req',
          'matches_acpt.user_acpt',
        ],
        where: {
          id,
        },
      })
      .catch((error) => {
        if (error.code === '22P02') throw new NotFoundException();
        throw error;
      });
  }

  findAll(): Observable<IUser[]> {
    return from(
      this.userRepository.find({
        relations: ['joined_channels', 'joined_channels.channel'],
      }),
    );
  }

  deleteUser(id: string) {
    // TODO remove sessions from deleted user
    // TODO disconnect websocket connections
    return this.userRepository.delete(id);
  }

  async findIntraUser(intraId: string): Promise<UserEntity> {
    return await this.userRepository.findOne({
      where: {
        intra_id: intraId,
      },
    });
  }

  async createUser(intraId: string): Promise<UserEntity> {
    const user: IUser = {
      name: 'name11',
      intra_id: intraId,
    };
    return await this.userRepository.save(user);
  }

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

  async update(id: string, data: IUser): Promise<any> {
    return this.userRepository.update(id, data);
  }

  async joinGuild(userId: string, anagram: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ id: userId });
    const guild = await this.guildsService.findGuild(anagram);
    if (!user || !guild) throw new NotFoundException();
    user.guild = guild;
    return await this.userRepository.save(user);
  }

  async getWarId(gamestats: IMatch) {
    await this.userRepository.find({
      relations: [
        'guild',
        // 'guild.current_war'
      ],
      where: {
        id: gamestats.user_id_acpt,
      },
    });

    this.userRepository.find({
      relations: [
        'guild',
        // 'guild.current_war'
      ],
      where: {
        id: gamestats.user_id_req,
      },
    });
    // console.log("user_acpt: \n", user_acpt);
    // console.log("user_req: \n", user_req);

    // let war_user_acpt = user_acpt.guild.current_war.id;
    // let war_user_req = user_req.guild.current_war.id;
    // if (war_user_acpt === war_user_req)
    //   return war_user_acpt;
    return null;
  }
}
