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
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { IUser } from '@/user.interface';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { IUserParam, UserParam } from '~/middleware/decorators/login.decorator';
import { UserEntity } from '@/user.entity';
import { User } from '~/middleware/decorators/login.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import { join } from 'path';
import { unlink } from 'fs';

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

  @Patch(':id/2fa')
  async twofactorEnable(@UserParam('id') user: IUserParam): Promise<any> {
    if (!user.isSelf) throw new UnauthorizedException();
    const data = await this.userService.enableTwoFactor(user.id);
    return data;
  }

  @Delete(':id/2fa')
  async twofactorDisable(@UserParam('id') user: IUserParam): Promise<any> {
    if (!user.isSelf) throw new UnauthorizedException();
    await this.userService.disableTwoFactor(user.id);
    return {
      status: true,
    };
  }

  @Post('join_guild/:anagram')
  async join_guild(
    @User() user: UserEntity,
    @Param('anagram') anagram: string,
  ): Promise<UserEntity> {
    return this.userService.joinGuild(user.id, anagram);
  }

  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: {
        files: 1,
        fileSize: 5000000, // 5mb
      },
      storage: diskStorage({
        destination: './uploads',
        filename(req, file, cb) {
          cb(null, uuidv4() + '.png');
        },
      }),
    }),
  )
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @UserParam('id') usr: IUserParam,
    @User() user: UserEntity,
  ): Promise<any> {
    if (!usr.isSelf && !user.isSiteAdmin()) throw new ForbiddenException();

    await this.deleteAvatarFile(usr.id);
    return await this.userService.updateAvatarName(usr.id, file.filename);
  }

  @Delete(':id/avatar')
  async deleteAvatar(
    @UserParam('id') usr: IUserParam,
    @User() user: UserEntity,
  ): Promise<any> {
    if (!usr.isSelf && !user.isSiteAdmin()) throw new ForbiddenException();

    await this.deleteAvatarFile(usr.id);
    return await this.userService.deleteAvatar(usr.id);
  }

  async deleteAvatarFile(id: string) {
    const user1 = await this.userService.findUser(id);
    if (user1.avatar !== null) {
      const ret = () => {
        return new Promise((resolve) => {
          unlink('uploads/' + user1.avatar, function (err) {
            if (err) {
              throw err;
            }
            resolve(1);
          });
        });
      };
      return await ret().catch((err) => {
        throw err;
      });
    }
  }

  @Get('avatar/:avatar_name')
  findAvatar(@Param('avatar_name') avatar_name, @Res() res): Observable<any> {
    return res.sendFile(join(process.cwd(), 'uploads/' + avatar_name));
  }
}
