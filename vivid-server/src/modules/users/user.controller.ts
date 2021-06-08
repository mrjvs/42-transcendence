import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { IUser } from '@/user.interface';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { UserEntity } from '~/models/user.entity';
import { User } from '~/middleware/decorators/login.decorator';
import { UpdateResult } from 'typeorm';
import { GuildsService } from '../guilds/guilds.service';

@Controller('users')
@UseGuards(AuthenticatedGuard)
export class UserController {
  constructor(
    private userService: UserService,
    private guildsService: GuildsService,
  ) {}

  @Post()
  add(@Body() user: IUser): Observable<IUser> {
    return this.userService.add(user);
  }

  @Get()
  findAll(): Observable<IUser[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findUser(@Param('id') id: string): Promise<IUser | void> {
    return await this.userService.findUser(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() name: string,
  ): Promise<IUser | void> {
    await this.userService.update(id, name);
    return await this.userService.findUser(id);
  }

  @Post('join_guild/:anagram')
  async join_guild(
    @User() user: UserEntity,
    @Param('anagram') anagram: string,
  ): Promise<UpdateResult> {
    this.guildsService.findGuildAnagram(anagram);
    return this.userService.joinGuild(user.id, anagram);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
