import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { IWar } from '@/war.interface';
import { WarsService } from './wars.service';

@Controller('wars')
@UseGuards(AuthenticatedGuard)
export class WarsController {
  constructor(private warsService: WarsService) {}

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

  // Start war
  @Patch('start/:war_id')
  startWar(@Param('war_id') warId: string) {
    return this.warsService.startWar(warId);
  }

  // End war
  @Patch('end/:war_id')
  endWar(@Param('war_id') warId: string) {
    return this.warsService.endWar(warId);
  }
}
