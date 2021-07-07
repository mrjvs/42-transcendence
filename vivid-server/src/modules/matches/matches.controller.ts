import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { IMatch } from '@/match.interface';
import { MatchesEntity } from '@/matches.entity';
import { MatchesService } from './matches.service';
import { UserService } from '$/users/user.service';

@Controller('matches')
@UseGuards(AuthenticatedGuard)
export class MatchesController {
  constructor(
    private matchesService: MatchesService,
    private userService: UserService,
  ) {}

  @Get('all')
  findAll(): Promise<MatchesEntity[]> {
    return this.matchesService.findAll();
  }

  // should this be an endpoint? nope it should probably nohhoot
  @Post('insert')
  async insertGame(@Body() match: IMatch): Promise<UpdateResult> {
    match.winner_id =
      match.points_acpt > match.points_req
        ? match.user_id_acpt
        : match.user_id_req;
    console.log(match.winner_id);
    // checking if both users are in the same war
    match.war_id = await this.userService.getWarId(match);
    return this.matchesService.insertGame(match);
  }
}
