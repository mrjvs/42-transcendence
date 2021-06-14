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
import { User } from '~/middleware/decorators/login.decorator';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { UserEntity } from '@/user.entity';
import { IWars } from '@/wars.interface';
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
  // @Post('add')
  // sendWarRequest(@Body() request: IWars,
  // @User() user: UserEntity)
  // {
  //   // console.log(request);
  //   return this.warsService.sendWarRequest(user.guild_id, request);
  // }

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
