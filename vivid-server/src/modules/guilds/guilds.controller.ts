import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { User } from '~/middleware/decorators/login.decorator';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { GuildsEntity } from '@/guilds.entity';
import { UserEntity } from '@/user.entity';
import { UserService } from '$/users/user.service';
import { GuildsService } from './guilds.service';
import { IGuild } from '@/guild.interface';

@Controller('guilds')
@UseGuards(AuthenticatedGuard)
export class GuildsController {
  constructor(
    private guildsService: GuildsService,
    private userService: UserService,
  ) {}

  @Get()
  async seeAll(): Promise<GuildsEntity[]> {
    return this.guildsService.getAll();
  }

  @Patch('change_anagram/:anagram')
  async changeGuildAnagram(
    @Param('anagram') anagram: string,
    @User() user: UserEntity,
  ): Promise<UpdateResult> {
    if (!anagram.match(/^[a-zA-Z1-9\-]{1,5}$/g))
      throw new BadRequestException();
    return this.guildsService.changeGuildAnagram(user.id, anagram);
  }

  @Patch('change_name/:name')
  async changeGuildName(
    @Param('name') name: string,
    @User() user: UserEntity,
  ): Promise<UpdateResult> {
    return this.guildsService.changeGuildName(user.id, name);
  }

  @Post('create')
  async createGuild(
    @Body() guild: IGuild,
    @User() user: UserEntity,
  ): Promise<UserEntity> {
    this.guildsService.createGuild(user, guild);
    return this.userService.joinGuild(user.id, guild.anagram);
  }

  @Delete('delete/:anagram')
  async deleteGuild(
    @Param('anagram') anagram: string,
    @User() user: UserEntity,
  ): Promise<DeleteResult> {
    const guild = await this.guildsService.findGuild(anagram);
    if (!guild) throw new NotFoundException();

    if (!(user.site_admin || guild.owner.id === user.id))
      throw new BadRequestException();

    return this.guildsService.deleteGuild(anagram);
  }

  @Get('rank')
  async guildsRankList(): Promise<GuildsEntity[]> {
    return await this.guildsService.guildsRankList();
  }
}
