import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { IGame } from '@/match.interface';
import { MatchesEntity } from '@/matches.entity';
import { MatchesService } from './matches.service';
import { UserService } from '../users/user.service';

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

  // This endpoint will be deleted later because only the end of an game should call a game history
  @Post('insert')
  async insertGame(@Body() gamestats: IGame): Promise<UpdateResult> {
    //defining winner out of gamestats
    // checking if both users are in the same war
    return this.matchesService.createGame(gamestats);
  }
}
