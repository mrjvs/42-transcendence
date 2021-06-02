import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  UseGuards,
  Param,
  Body,
} from '@nestjs/common';
import { UserParam, IUserParam } from '~/middleware/decorators/login.decorator';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import {
  IJoinedChannelInput,
  UserJoinedChannelDto,
} from '@/joined_channels.entity';
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

  // TODO permissions, only site admins can force join a user
  @Post('/:user')
  addChannelUser(
    @Param('id') channel: string,
    @Body() requestBody: UserJoinedChannelDto,
    @UserParam('user') userParam: IUserParam,
  ): any {
    const input: IJoinedChannelInput = {
      channel,
      user: userParam.id,
      password: requestBody.password,
    };
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

  // TODO permissions, only moderators/owner/siteadmin can remove someone
  @Delete('/:user')
  removeChannelUser(
    @Param('id') channel: string,
    @UserParam('user') userParam: IUserParam,
  ): any {
    const input: IJoinedChannelInput = {
      channel,
      user: userParam.id,
    };
    return this.channelService.removeUser(input);
  }
}
