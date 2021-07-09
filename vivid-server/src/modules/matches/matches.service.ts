import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { IGame } from '@/match.interface';
import { MatchesEntity } from '@/matches.entity';
import { UserService } from '$/users/user.service';

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

  async createGame(gamestats: IGame): Promise<UpdateResult> {
    gamestats.winner_id =
      gamestats.points_acpt > gamestats.points_req
        ? gamestats.user_id_acpt
        : gamestats.user_id_req;
    // console.log('stats', gamestats);
    const user_req = await this.userService.findUser(gamestats.user_id_req);
    const user_acpt = await this.userService.findUser(gamestats.user_id_acpt);
    if (!user_req || !user_acpt) return;
    const war = await this.userService.getWarId(gamestats);
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
        winner_id: gamestats.winner_id,
        war_id: war,
      })
      .execute();
  }
}
