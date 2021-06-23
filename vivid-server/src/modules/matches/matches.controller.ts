import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { IGame } from '@/match.interface';
import { MatchesEntity } from '@/matches.entity';
import { MatchesService } from './matches.service';
import { Cron } from '@nestjs/schedule';
import { UserService } from '../users/user.service';

@Controller('matches')
@UseGuards(AuthenticatedGuard)
export class MatchesController {
  constructor(
    private matchesService: MatchesService,
    private userService: UserService
    ) {}

  @Get('all')
  findAll(): Promise<MatchesEntity[]> {
    return this.matchesService.findAll();
  }

  // should this be an endpoint? nope it should probably nohhoot
  @Post('insert')
  async insertGame(@Body() gamestats: IGame): Promise<UpdateResult> {
    //defining winner out of gamestats
    gamestats.winner_id =
      gamestats.points_acpt > gamestats.points_req
        ? gamestats.user_id_acpt
        : gamestats.user_id_req;
    console.log(gamestats.winner_id);
    // checking if both users are in the same war
    return this.matchesService.insertGame(gamestats);
  }
}
