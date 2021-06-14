import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
  async seeAll() {
    return this.guildsService.getAll();
  }

  @Post('change_anagram/:anagram')
  async changeGuildAnagram(
    @Param('anagram') anagram: string,
    @User() user: UserEntity,
  ): Promise<UserEntity> {
    if (!anagram.match(/^[a-zA-Z1-9\-]{1,5}$/g))
      throw new BadRequestException();
    // let old_anagram = user.guild_anagram;
    this.guildsService.changeGuildAnagram(user.id, anagram);
    // if (old_anagram !== null)
    // this.userService.changeUsersAnagram(old_anagram, anagram);
    return user;
  }

  @Post('change_name/:name')
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

  @Patch('deactivate/:anagram')
  async deactivateGuild(
    @Param('anagram') anagram: string,
    @User() user: UserEntity,
  ): Promise<DeleteResult> {
    let guild = await this.guildsService.findGuildAnagram(anagram);
    if (user.admin || (guild && guild.owner === user)) {
      // this.userService.changeUsersAnagram(anagram, null); TODO
      guild.owner = null;
      //TODO take out the owner.
      return this.guildsService.deactivateGuild(anagram);
    }
  }

  @Get('rank')
  async rankGuilds(): Promise<GuildsEntity[]> {
    console.log(await this.guildsService.changeWarId('lego', 'art of war3'));
    return await this.guildsService.rankGuilds();
  }

  // delete this one
  @Post('win')
  async Guildwin() {
    return this.guildsService.guildWin('other', 50);
  }
}
