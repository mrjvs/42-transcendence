import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Post,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { IUser } from '@/user.interface';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { IUserParam, UserParam } from '~/middleware/decorators/login.decorator';
import { UserEntity } from '@/user.entity';
import { User } from '~/middleware/decorators/login.decorator';
import { DeleteResult } from 'typeorm';
import { Cron } from '@nestjs/schedule';

@Controller('users')
@UseGuards(AuthenticatedGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  add(@Body() user: IUser): Observable<IUser> {
    return this.userService.add(user);
  }

  @Get()
  findAll(): Observable<IUser[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findUser(
    @UserParam('id') usr: IUserParam,
    @User() user: UserEntity,
  ): Promise<IUser> {
    if (!usr.isSelf && !user.isSiteAdmin()) throw new ForbiddenException();
    return await this.userService.findUser(usr.id);
  }

  @Get('matches/:id')
  async findUsermatches(@Param('id') id: string): Promise<IUser | void> {
    return await this.userService.findUserMatches(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() user: IUser,
  ): Promise<IUser | void> {
    return await this.userService.update(id, user);
  }

  @Post('join_guild/:anagram')
  async join_guild(
    @User() user: UserEntity,
    @Param('anagram') anagram: string,
  ): Promise<UserEntity> {
    return this.userService.joinGuild(user.id, anagram);
  }

  @Delete(':id')
  deleteUser(@UserParam('id') usr: IUserParam, @User() user: UserEntity) {
    if (!usr.isSelf && !user.isSiteAdmin()) throw new ForbiddenException();
    return this.userService.deleteUser(usr.id);
  }
}
