import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IMatch, MatchesEntity } from '@/matches.entity';
import { IGameState } from '$/pong/game.interface';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(MatchesEntity)
    private matchesRepository: Repository<MatchesEntity>,
  ) {}

  async findUserMatches(userId: string): Promise<MatchesEntity[]> {
    return await this.matchesRepository
      .createQueryBuilder()
      .where('user_acpt = :id OR user_req = :id', { id: userId })
      .orderBy({ game_ended: 'DESC' })
      .getMany();
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
