import { Controller, Get, Post, Delete, Patch } from '@nestjs/common';

@Controller('channels/:id/messages')
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
