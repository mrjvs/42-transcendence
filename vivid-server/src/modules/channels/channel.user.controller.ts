import { Controller, Get, Post, Delete, Patch } from '@nestjs/common';

@Controller('channels/:id/users')
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
