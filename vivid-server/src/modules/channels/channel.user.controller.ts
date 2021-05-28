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
  @Get('/')
  getChannelUsers(): any {
    return {};
  }

  @Get('/:user')
  getChannelUser(): any {
    return {};
  }

  @Post('/:user')
  addChannelUser(): any {
    return {};
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
