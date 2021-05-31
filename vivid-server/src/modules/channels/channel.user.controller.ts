import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  UseGuards,
  Param,
} from '@nestjs/common';
import { User } from '~/middleware/decorators/login.decorator';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { IJoinedChannelInput } from '~/models/joined_channels.entity';
import { UserEntity } from '~/models/user.entity';
import { ChannelService } from './channel.service';

// TODO do entire file with permissions

@Controller('channels/:id/users')
@UseGuards(AuthenticatedGuard)
export class ChannelUserController {
  constructor(private channelService: ChannelService) {}

  @Get('/')
  getChannelUsers(): any {
    return {};
  }

  @Get('/:user')
  getChannelUser(): any {
    return {};
  }

  @Post('/:user')
  addChannelUser(
    @Param('id') channel: string,
    @Param('user') userId: string,
    @User() user: UserEntity,
  ): any {
    const input: IJoinedChannelInput = {
      channel,
      user: userId,
    };
    if (input.user === '@me') input.user = user.id;
    return this.channelService.addUser(input);
  }

  @Patch('/:user')
  updateChannelUser(): any {
    return {};
  }

  @Patch('/:user/permissions')
  updateChannelUserPermisions(): any {
    return {};
  }

  @Delete('/:user')
  removeChannelUser(): any {
    return {};
  }
}
