import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  IUserParam,
  User,
  UserParam,
} from '~/middleware/decorators/login.decorator';
import { AccountNotSetupGuard } from '~/middleware/guards/auth.guards';
import {
  FullDetailsUser,
  UnrelatedUser,
  UserEntity,
  UsernameChangeDto,
} from '@/user.entity';
import { formatObject } from '~/utils/format';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(AccountNotSetupGuard)
export class UserSetupController {
  constructor(private userService: UserService) {}

  @Get('/find/:username')
  async findUsers(@Param('username') username: string): Promise<any> {
    const userRet = await this.userService.findUsers(username);
    return formatObject(UnrelatedUser, userRet);
  }

  // TODO private vs public data
  @Get(':id')
  async findUser(
    @UserParam('id') usr: IUserParam,
    @User() user: UserEntity,
  ): Promise<any> {
    if (!usr.isSelf && !user.isSiteAdmin()) throw new ForbiddenException();
    const userRet = await this.userService.findUser(usr.id);
    return formatObject(FullDetailsUser, userRet);
  }

  @Patch('/:id/name')
  async changeName(
    @UserParam('id') user: IUserParam,
    @Body() newName: UsernameChangeDto,
  ): Promise<any> {
    const res = await this.userService.updateName(user.id, newName.username);
    return {
      id: res.id,
      name: res.name,
    };
  }

  @Delete(':id')
  deleteUser(@UserParam('id') usr: IUserParam, @User() user: UserEntity) {
    if (!usr.isSelf && !user.isSiteAdmin()) throw new ForbiddenException();
    return this.userService.deleteUser(usr.id);
  }
}
