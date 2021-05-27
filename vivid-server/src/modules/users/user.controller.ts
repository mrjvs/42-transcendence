import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { IUser } from '@/user.interface';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';

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
  async findUser(@Param('id') id: string): Promise<IUser> {
    return await this.userService.findUser(id);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
