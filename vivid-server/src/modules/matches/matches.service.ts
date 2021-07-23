import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { IGame } from '@/match.interface';
import { IMatch, MatchesEntity } from '@/matches.entity';
import { UserService } from '$/users/user.service';
import { IGameState } from '~/models/game.interface';

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
        user_req: user_req.id,
        user_acpt: user_acpt.id,
        points_req: game.points_req,
        points_acpt: game.points_acpt,
        addons: game.add_ons,
        game_type: game.game_type,
        winner_id: game.winner_id,
        war_id: war.id,
      })
      .execute();
  }

  async saveMatchResults(
    game: IGameState,
    endDate: Date,
    gameType,
  ): Promise<IMatch> {
    const newMatch: IMatch = {
      id: game.gameId,
      user_req: game.players[0].userId,
      user_acpt: game.players[1].userId,
      game_ended: endDate,
      user_req_score: game.players[0].score,
      user_acpt_score: game.players[1].score,
      addons: game.settings.addons.join(';'),
      game_type: gameType,
      winner_id: game.winner,
      time_elapsed: game.amountOfSeconds,
    };

    return await this.matchesRepository.save(newMatch);
  }

  async findMatch(gameId: string): Promise<IMatch> {
    return await this.matchesRepository.findOne(gameId);
  }
}
