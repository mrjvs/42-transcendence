import {
  Controller,
  ForbiddenException,
  forwardRef,
  Get,
  Inject,
  UseGuards,
} from '@nestjs/common';
import {
  IUserParam,
  User,
  UserParam,
} from '~/middleware/decorators/login.decorator';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { UserEntity } from '@/user.entity';
import { MatchesService } from '$/matches/matches.service';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(AuthenticatedGuard)
export class StatsController {
  constructor(
    private statsService: StatsService,
    @Inject(forwardRef(() => MatchesService))
    private matchesService: MatchesService,
  ) {}

  @Get('/:user')
  async userStats(
    @UserParam('user') user: IUserParam,
    @User() usr: UserEntity,
  ): Promise<Record<string, string>> {
    if (!user.isSelf && !usr.isSiteAdmin()) throw new ForbiddenException();
    const messagesCount = await this.statsService.userMessagesCount(user.id);
    const sessionsCount = await this.statsService.userLoginCount(user.id);
    const secretCount = await this.statsService.userSecretCount(user.id);

    const userMatches = await this.matchesService.findUserMatches(user.id);
    const matchesPlayed = userMatches.length;
    const wonGamesCount = userMatches.filter(
      (v: any) => v.winner_id === user.id,
    ).length;
    const lostGamesCount = matchesPlayed - wonGamesCount;

    return {
      matches_played: `${matchesPlayed}`,
      won_games: `${wonGamesCount}`,
      lost_games: `${lostGamesCount}`,
      messages_count: messagesCount,
      secrets_count: secretCount,
      sessions_count: `${sessionsCount}`,
    };
  }

  @Get('/')
  async globalStats(): Promise<Record<string, string>> {
    const matchesPlayed = await this.statsService.matchesCount();
    const usersCount = await this.statsService.usersCount();
    const channelsCount = await this.statsService.channelsCount();
    const messagesCount = await this.statsService.messagesCount();
    const twofaCount = await this.statsService.twoFaCount();

    return {
      matches_played: matchesPlayed,
      users_accounts: usersCount,
      public_channels: channelsCount,
      messages_count: messagesCount,
      twofa_users: twofaCount,
      months_coding: '3',
    };
  }
}
