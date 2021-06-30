import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { UserEntity, UsernameChangeDto } from '~/models/user.entity';
import { IUser } from '~/models/user.interface';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(AccountNotSetupGuard)
export class UserSetupController {
  constructor(private userService: UserService) {}

  @Patch('/:id/name')
  changeName(
    @UserParam('id') user: IUserParam,
    @Body() newName: UsernameChangeDto,
  ): Promise<IUser> {
    return this.userService.updateName(user.id, newName.username);
  }

  @Delete(':id')
  deleteUser(@UserParam('id') usr: IUserParam, @User() user: UserEntity) {
    if (!usr.isSelf && !user.isSiteAdmin()) throw new ForbiddenException();
    return this.userService.deleteUser(usr.id);
  }
}
