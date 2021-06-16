import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { IGame } from '@/match.interface';
import { MatchesEntity } from '@/matches.entity';
import { MatchesService } from './matches.service';

@Controller('matches')
@UseGuards(AuthenticatedGuard)
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Get('all')
  findAll(): Promise<MatchesEntity[]> {
    return this.matchesService.findAll();
  }

  // should this be an endpoint? nope it should probably nohhoot
  @Post('insert')
  async insertGame(@Body() gamestats: IGame): Promise<UpdateResult> {
    gamestats.winner_id =
      gamestats.points_acpt > gamestats.points_req
        ? gamestats.user_id_acpt
        : gamestats.user_id_req;
    console.log(gamestats.winner_id);
    return this.matchesService.insertGame(gamestats);
  }
}
