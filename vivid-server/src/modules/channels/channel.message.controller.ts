import { Controller, Get, Post, Delete, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';

@Controller('channels/:id/messages')
@UseGuards(AuthenticatedGuard)
export class ChannelMessageController {
  @Get('/')
  getMessageHistory(): any {
    return {};
  }

  @Post('/')
  createMessage(): any {
    return {};
  }

  @Delete('/:message')
  addChannelUser(): any {
    return {};
  }
}
