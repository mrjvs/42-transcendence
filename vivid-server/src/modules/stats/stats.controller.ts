import { Controller, ForbiddenException, Get, UseGuards } from '@nestjs/common';
import {
  IUserParam,
  User,
  UserParam,
} from '~/middleware/decorators/login.decorator';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { UserEntity } from '~/models/user.entity';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(AuthenticatedGuard)
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('/:user')
  async userStats(
    @UserParam('user') user: IUserParam,
    @User() usr: UserEntity,
  ): Promise<any> {
    if (!user.isSelf && !usr.isSiteAdmin()) throw new ForbiddenException();
    const messageCount = await this.statsService.userMessagesCount(user.id);

    return {
      message_count: messageCount,
    };
  }

  @Get('/')
  async globalStats(): Promise<any> {
    return {
      matchesPlayed: 2354,
      userAccounts: 20,
      publicChannels: 42,
      messageCount: 220,
      twoFaUsers: 23,
    };
  }
}
