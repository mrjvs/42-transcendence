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

  async createGame(game: IGame): Promise<UpdateResult> {
    const user_req = await this.userService.findUser(game.user_id_req);
    const user_acpt = await this.userService.findUser(game.user_id_acpt);
    if (!user_req || !user_acpt) return;
    const war = await this.userService.getWarId(game);

    return await this.matchesRepository
      .createQueryBuilder()
      .insert()
      .values({
        user_req: user_req,
        user_acpt: user_acpt,
        points_req: game.points_req,
        points_acpt: game.points_acpt,
        add_ons: game.add_ons,
        game_type: game.game_type,
        winner_id: game.winner_id,
        war_id: war,
      })
      .execute();
  }
}
