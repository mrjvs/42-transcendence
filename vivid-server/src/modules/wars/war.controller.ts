import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { IWar } from '@/war.interface';
import { WarService } from './war.service';

@Controller('wars')
@UseGuards(AuthenticatedGuard)
export class WarController {
  constructor(private warsService: WarService) {}

  // @Admin() TODO
  @Get('all')
  getAllWars() {
    return this.warsService.getAllWars();
  }

  // Send War Request
  @Post('add')
  sendWarRequest(@Body() request: IWar) {
    return this.warsService.sendWarRequest(request);
  }

  // Accept War Request
  @Patch(':war_id')
  acceptWarRequest(@Param('war_id') warId: string) {
    return this.warsService.acceptWarRequest(warId);
  }

  // Decline War Request
  @Delete(':war_id')
  declineWarRequest(@Param('war_id') warId: string) {
    return this.warsService.declineWarRequest(warId);
  }
}
