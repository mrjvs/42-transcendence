import { Body, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';

import { LadderService } from '$/ladder/ladder.service';
import { ILadder, LadderPaginationDto } from '@/ladder.entity';
import { ILadderUser, LadderUserEntity } from '@/ladder_user.entity';
import { User } from '~/middleware/decorators/login.decorator';
import { UserEntity } from '~/models/user.entity';

@Controller('ladder')
@UseGuards(AuthenticatedGuard)
export class LadderController {
  constructor(private ladderService: LadderService) {}

  @Get('/')
  getLadders(): Promise<ILadder[]> {
    return this.ladderService.listLadders();
  }

  @Get('/all')
  async getLaddersAndLadderUsers(
    @User() user: UserEntity,
  ): Promise<{ ladders: ILadder[]; ladderUsers: any[] }> {
    const ladders = await this.ladderService.listLadders();
    let ladderUsers: any[] = await this.ladderService.getUserLadders(user.id);
    ladderUsers.forEach(
      (v: any) => (v.ladder = ladders.find((j) => j.id === v.ladder)),
    );
    ladderUsers = ladderUsers.map((v: LadderUserEntity) => ({
      ...v,
      rank: v.getRank(),
    }));
    return {
      ladders,
      ladderUsers,
    };
  }

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

  @Get('/:id/user/:user')
  getUser(
    @Param('id') ladderId: string,
    @Param('user') userId: string,
  ): Promise<ILadderUser> {
    return this.ladderService.getUser(ladderId, userId);
  }
}
