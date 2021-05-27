import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';

@Controller('channels/:id/users')
@UseGuards(AuthenticatedGuard)
export class ChannelUserController {
  constructor() {}

  @Get('/')
  getChannelUsers(): Object {
    return {};
  }

  @Get('/:user')
  getChannelUser(): Object {
    return {};
  }

  @Post('/:user')
  addChannelUser(): Object {
    return {};
  }

  @Patch('/:user')
  updateChannelUser(): Object {
    return {};
  }

  @Patch('/:user/permissions')
  updateChannelUserPermisions(): Object {
    return {};
  }

  @Delete('/:user')
  removeChannelUser(): Object {
    return {};
  }
}
