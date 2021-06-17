import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from } from 'rxjs';
import { Repository } from 'typeorm';
import { UserEntity } from '@/user.entity';
import { IUser } from '@/user.interface';
import { GuildsService } from '$/guilds/guilds.service';
import { IGame } from '~/models/match.interface';

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

  async joinGuild(userId: string, anagram: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ id: userId });
    const guild = await this.guildsService.findGuildAnagram(anagram);
    user.guild = guild;
    return await this.userRepository.save(user);
  }

  async getWarId(gamestats: IGame){
    const user_acpt = await this.userRepository
    .find({
      relations: [
        'guild',
        // 'guild.current_war'
      ], 
      where: {
        id: gamestats.user_id_acpt,
      },
    })

    const user_req = await this.userRepository
    .find({
      relations: [
        'guild',
        // 'guild.current_war'
      ],
      where: {
        id: gamestats.user_id_req,
      },
    })
    // console.log("user_acpt: \n", user_acpt);
    // console.log("user_req: \n", user_req);

    // let war_user_acpt = user_acpt.guild.current_war.id;
    // let war_user_req = user_req.guild.current_war.id;
    // if (war_user_acpt === war_user_req)
    //   return war_user_acpt;
    return null;  
  }
}
