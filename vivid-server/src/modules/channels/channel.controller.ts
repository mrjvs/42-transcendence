import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ChannelService } from './channel.service';
import { IChannel } from '@/channel.entity';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';

@Controller('channels')
@UseGuards(AuthenticatedGuard)
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Get('/')
  getChannelList(): Observable<IChannel[]> {
    return this.channelService.findAll();
  }

  @Post('/')
  createChannel(): any {
    return {};
  }

  @Patch('/:id')
  updateChannel(): any {
    return {};
  }

  @Delete('/:id')
  removeChannel(): any {
    return {};
  }
}
