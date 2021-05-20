import { Body, Controller, Delete, Get, Post, Param } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ChannelService } from './channel.service';

@Controller('users')
export class ChannelController {
  constructor(private channelService: ChannelService) {}
}
