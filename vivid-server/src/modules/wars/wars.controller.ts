import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
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

  @Get('end')
  endWar() {
    return this.warsService.endOfWar('b68ce184-6376-4db1-8519-3d7f4e6a2313');
  }
}
