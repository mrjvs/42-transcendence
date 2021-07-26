import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { User } from '~/middleware/decorators/login.decorator';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { UserEntity } from '@/user.entity';
import { DmService } from './dm.service';
import { ChannelEntity } from '@/channel.entity';

@Controller('dms')
@UseGuards(AuthenticatedGuard)
export class DmController {
  constructor(private dmService: DmService) {}

  @Get('/:userid')
  getChannelUsers(
    @Param('userid') userId: string,
    @User() user: UserEntity,
  ): Promise<ChannelEntity> {
    return this.dmService.getDM(userId, user.id);
  }
}
