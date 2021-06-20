import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from } from 'rxjs';
import { Repository } from 'typeorm';
import { UserEntity } from '@/user.entity';
import { IUser } from '@/user.interface';
import { GuildsService } from '$/guilds/guilds.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
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
}
