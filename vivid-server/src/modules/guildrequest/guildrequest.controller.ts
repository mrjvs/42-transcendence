import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { User } from '~/middleware/decorators/login.decorator';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { GuildRequestEntity } from '@/guild_request.entity';
import { UserEntity } from '@/user.entity';
import { UserService } from '$/users/user.service';
import { GuildRequestService } from './guildrequest.service';

@Controller('guildrequest')
@UseGuards(AuthenticatedGuard)
export class GuildrequestController {
  constructor(
    private guildRequestService: GuildRequestService,
    private userService: UserService,
  ) {}

  // TODO @MustbeAdmin()
  @Get('all')
  findAll(): Promise<GuildRequestEntity[]> {
    return this.guildRequestService.findAll();
  }

  @Get('requests')
  findRequests(@User() user: UserEntity): Promise<GuildRequestEntity[]> {
    return this.guildRequestService.findAllGuildRequests(user.id);
  }

  @Post('add/:user_id')
  async guildRequest(
    @Param('user_id') invitedId: string,
    @User() user: UserEntity,
  ): Promise<InsertResult> {
    // checking if friend is in general user table.
    const invited = await this.userService.findUser(invitedId);
    if (!invited) throw new NotFoundException();

    // checking if invited user is the logged in user.
    if (user.id === invited.id) throw new BadRequestException();
    console.log("hi");
    // checking if logged in user has an guild which it can invite people in.
    // if (user.guild === null) throw new BadRequestException();
    
    // guild already exist because it couldn't be in the user if it didn't
    // the entity already has a unique combination restricting of user and guild
    
    console.log("hi");
    console.log(user);
    return this.guildRequestService.sendGuildRequest(
      invited.id,
      user.id,
      user.guild,
    );
  }

  @Patch('accept/:guildRequest_id')
  async acceptRequest(
    @Param('guildRequest_id') guildRequestId: string,
    @User() user: UserEntity,
  ): Promise<UserEntity> {
    await this.guildRequestService.acceptGuildRequest(user.id, guildRequestId);
    let request = await this.guildRequestService.findone(guildRequestId);
    return this.userService.joinGuild(user.id, request.guild_anagram);
  }

  @Delete('decline/:guildRequest_id')
  async unfriend(
    @Param('guildRequest_id') guildRequestId: string,
    @User() user: UserEntity,
  ): Promise<DeleteResult> {
    return this.guildRequestService.deleteGuildRequest(user.id, guildRequestId);
  }
}
