import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from } from 'rxjs';
import { Repository } from 'typeorm';
import { UserEntity } from '@/user.entity';
import { IUser } from '@/user.interface';
import { parse } from 'cookie';
import { getSessionStore } from '../auth/auth-session';
import { resolve } from 'path';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  add(user: IUser): Observable<IUser> {
    return from(this.userRepository.save(user));
  }

  async findUser(id: string): Promise<UserEntity> {
    return await this.userRepository.findOne({
      relations: ['joined_channels', 'joined_channels.channel'],
      where: {
        id,
      },
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
      intra_id: intraId,
    };
    return await this.userRepository.save(user);
  }

  async getUserIdFromCookie(cookie: string): Promise<string | null> {
    // parse cookie data
    if (!cookie) return null;
    const parsedCookie = parse(cookie);
    const cookieData = parsedCookie['vivid.login']; // TODO get from config
    if (!cookieData) return null;

    // cookie format: "s:<ID>.<HASH>"
    // this code extracts the id
    // TODO check hash before removal
    const hashRemoved = cookieData.split('.');
    if (hashRemoved.length !== 2) return null;
    const prefixRemoved = hashRemoved[0].split(':');
    if (prefixRemoved.length !== 2) return null;
    const id = prefixRemoved[1];

    // fetch session from database
    let sessionData;
    try {
      sessionData = await new Promise((resolve, reject) => {
        getSessionStore().get(id, (error?: any, result?: any) => {
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
}
