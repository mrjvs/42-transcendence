import { Controller, Get, Post, Delete, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';

@Controller('channels/:id/messages')
@UseGuards(AuthenticatedGuard)
export class ChannelMessageController {
  constructor() {}

  @Get('/')
  getMessageHistory(): Object {
    return {};
  }

  @Post('/')
  createMessage(): Object {
    return {};
  }

  @Delete('/:message')
  addChannelUser(): Object {
    return {};
  }
}
