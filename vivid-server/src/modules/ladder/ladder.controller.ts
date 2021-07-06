import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';

import { LadderService } from '$/ladder/ladder.service';
import { ILadder, LadderPaginationDto } from '@/ladder.entity';
import { ILadderUser } from '@/ladder_user.entity';

@Controller('ladder')
@UseGuards(AuthenticatedGuard)
export class LadderController {
  constructor(private ladderService: LadderService) {}

  @Get('/:id')
  getLadder(
    @Param('id') ladderId: string,
    ladderPagination?: LadderPaginationDto,
  ): Promise<ILadderUser[]> {
    return this.ladderService.listLadder(ladderId, ladderPagination);
  }

  @Get('/:id/rank')
  getRank(
    @Param('id') ladderId: string,
    @Body('rank') rank: string,
    ladderPagination?: LadderPaginationDto,
  ): Promise<ILadderUser[]> {
    return this.ladderService.listRank(ladderId, rank, ladderPagination);
  }

  @Get('/:id/:user')
  getUser(
    @Param('id') ladderId: string,
    @Param('user') userId: string,
  ): Promise<ILadderUser> {
    return this.ladderService.getUser(ladderId, userId);
  }

  @Get('/:id/matchmake')
  startMatchmaking(
    @Param('id') ladderId: string,
    @Body('user') ladderUser: ILadderUser,
  ): Promise<ILadderUser> {
    return this.ladderService.matchMake(ladderId, ladderUser);
  }

  @Patch('/:id/rating')
  adjustRating(
    @Param('id') ladderId: ILadder,
    @Body('usr1') usr1: ILadderUser,
    @Body('usr2') usr2: ILadderUser,
  ): Promise<ILadderUser[]> {
    return this.ladderService.adjustRating(ladderId, usr1, usr2, true);
  }
}
