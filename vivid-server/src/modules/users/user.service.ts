import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from } from 'rxjs';
import { Repository, UpdateResult } from 'typeorm';
import { UserEntity } from '@/user.entity';
import { IUser } from '@/user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  add(user: IUser): Observable<IUser> {
    return from(this.userRepository.save(user));
  }

  async findUser(id: string): Promise<UserEntity | void> {
    return await this.userRepository
      .findOne({
        relations: ['joined_channels', 'joined_channels.channel'],
        where: {
          id,
        },
      })
      .catch((error) => {
        if (error.code === '22P02') throw new NotFoundException();
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
      name: 'name11',
      intra_id: intraId,
    };
    return await this.userRepository.save(user);
  }

  async update(id: string, data): Promise<any> {
    return this.userRepository.update(id, data);
  }

  async changeUsersAnagram(
    old_anagram: string,
    anagram: string,
  ): Promise<UpdateResult> {
    return this.userRepository
      .createQueryBuilder()
      .update()
      .set({
        guild_anagram: anagram,
      })
      .where('guild_anagram = :guild_anagram', { guild_anagram: old_anagram })
      .execute()
      .catch((error) => {
        if (error.code === '23505') throw new BadRequestException();
        throw error;
      });
  }

  async joinGuild(userId: string, anagram: string): Promise<UpdateResult> {
    return this.userRepository
      .createQueryBuilder()
      .update()
      .set({
        guild_anagram: anagram,
      })
      .where('id = :id', { id: userId })
      .execute()
      .catch((error) => {
        if (error.code === '23505') throw new BadRequestException();
        throw error;
      });
  }
}
