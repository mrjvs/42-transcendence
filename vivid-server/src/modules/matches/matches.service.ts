import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { IMatch } from '@/match.interface';
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

  async insertGame(match: IMatch): Promise<UpdateResult> {
    // console.log('stats', match);
    const user_req = await this.userService.findUser(match.user_id_req);
    const user_acpt = await this.userService.findUser(match.user_id_acpt);
    // console.log('user_req', user_req);
    // console.log('user_acpt', user_acpt);
    return await this.matchesRepository
      .createQueryBuilder()
      .insert()
      .values({
        user_req: user_req,
        user_acpt: user_acpt,
        points_req: match.points_req,
        points_acpt: match.points_acpt,
        add_ons: match.add_ons,
        game_type: match.game_type,
        winner_id: match.winner_id,
      })
      .execute();
  }
}
