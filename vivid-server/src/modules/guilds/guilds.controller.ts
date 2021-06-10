import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { join } from 'path';
import { DeleteResult, UpdateResult } from 'typeorm';
import { User } from '~/middleware/decorators/login.decorator';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { GuildsEntity } from '@/guilds.entity';
import { UserEntity } from '@/user.entity';
import { UserService } from '$/users/user.service';
import { GuildsService } from './guilds.service';

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
  ): Promise<UserEntity>{
    if (anagram.length > 5) throw new BadRequestException();
    let old_anagram = user.guild_anagram;
    this.guildsService.changeGuildAnagram(user.id, anagram);
    this.userService.joinGuild(user.id, anagram);
    if (old_anagram !== null)
      this.userService.changeUsersAnagram(old_anagram, anagram);
    return user;
  }

  @Post('change_name/:name')
  async changeGuildName(
    @Param('name') name: string,
    @User() user: UserEntity,
  ): Promise<UpdateResult> {
    return this.guildsService.changeGuildName(user.id, name);
  }

  @Post('create/:name')
  async createGuild(
    @Param('name') name: string,
    @User() user: UserEntity,
  ): Promise<UpdateResult> {
    return this.guildsService.createGuild(user.id, name);
  }

  @Patch('deactivate/:anagram')
  async deactivateGuild(
    @Param('anagram') anagram: string,
    @User() user: UserEntity,
  ): Promise<DeleteResult> {
    let user_guild = await this.guildsService.findGuildAnagram(
      anagram,
    );
    if (user.admin || (user_guild && user_guild.owner === user.id)) {
      this.userService.changeUsersAnagram(anagram, null);
      return this.guildsService.deactivateGuild(anagram);
    }
  }

  @Get('rank')
  async rankGuilds() 
    : Promise<GuildsEntity[]>{
    console.log(await this.guildsService.changeWarId('lego', 'art of war3'));
    return await this.guildsService.rankGuilds();
  }

  // delete this one
  @Post('win')
  async Guildwin() {
    return this.guildsService.guildWin("other", 50);
  }
}
