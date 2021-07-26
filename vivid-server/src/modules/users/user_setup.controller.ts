import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  IUserParam,
  User,
  UserParam,
} from '~/middleware/decorators/login.decorator';
import { AccountNotSetupGuard } from '~/middleware/guards/auth.guards';
import { FullDetailsUser, UserEntity, UsernameChangeDto } from '@/user.entity';

import { formatObject } from '~/utils/format';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(AccountNotSetupGuard)
export class UserSetupController {
  constructor(private userService: UserService) {}

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
    @User() usr: UserEntity,
    @Body() newName: UsernameChangeDto,
  ): Promise<any> {
    if (!user.isSelf && !usr.isSiteAdmin()) throw new ForbiddenException();
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
