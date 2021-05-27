import { Controller, Get, Post, Delete, Patch } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ChannelService } from './channel.service';
import { IChannel } from '@/channel.entity';

@Controller('channels')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Get('/')
  getChannelList(): Observable<IChannel[]> {
    return this.channelService.findAll();
  }

  @Post('/')
  createChannel(): Object {
    return {};
  }

  @Patch('/:id')
  updateChannel(): Object {
    return {};
  }

  @Delete('/:id')
  removeChannel(): Object {
    return {};
  }
}
