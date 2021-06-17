import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { IGame } from '~/models/match.interface';
import { MatchesEntity } from '~/models/matches.entity';
import { UserService } from '../users/user.service';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(MatchesEntity)
    private matchesRepository: Repository<MatchesEntity>,
    private userService: UserService,
  ) {}

  async findAll(): Promise<MatchesEntity[]> {
    return await this.matchesRepository.createQueryBuilder().select().execute();
  }

  async insertGame(gamestats: IGame)
    : Promise<UpdateResult> 
  {
    // console.log('stats', gamestats);
    const user_req = await this.userService.findUser(gamestats.user_id_req); 
    const user_acpt = await this.userService.findUser(gamestats.user_id_acpt); 
    // console.log('user_req', user_req);
    // console.log('user_acpt', user_acpt);
    return await this.matchesRepository
    .createQueryBuilder()
    .insert()
    .values({
      user_req: user_req,
      user_acpt: user_acpt,
      points_req: gamestats.points_req,
      points_acpt: gamestats.points_acpt,
      add_ons: gamestats.add_ons,
      game_type: gamestats.game_type,
      winner_id: gamestats.winner_id
    })
    .execute()
  }

  
}
