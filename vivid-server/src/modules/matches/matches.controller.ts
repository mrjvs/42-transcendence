import { Controller, ForbiddenException, Get, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { MatchesEntity } from '@/matches.entity';
import { MatchesService } from './matches.service';
import {
  IUserParam,
  User,
  UserParam,
} from '~/middleware/decorators/login.decorator';
import { UserEntity } from '~/models/user.entity';

@Controller('matches')
@UseGuards(AuthenticatedGuard)
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Get('/:user')
  findUserMatches(
    @UserParam('user') user: IUserParam,
    @User() usr: UserEntity,
  ): Promise<MatchesEntity[]> {
    if (!user.isSelf && !usr.isSiteAdmin()) throw new ForbiddenException();
    return this.matchesService.findUserMatches(user.id);
  }
}
