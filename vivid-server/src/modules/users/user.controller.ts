import {
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
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { IUserParam, UserParam } from '~/middleware/decorators/login.decorator';
import { IUser, UserEntity } from '@/user.entity';
import { User } from '~/middleware/decorators/login.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import { join } from 'path';
import { unlink } from 'fs';
import { Request } from 'express';

@Controller('users')
@UseGuards(AuthenticatedGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Delete(':id/sessions')
  async deleteSessions(
    @UserParam('id') user: IUserParam,
    @User('id') usr: UserEntity,
    @Req() req: Request,
  ): Promise<void> {
    if (!user.isSelf && !usr.isSiteAdmin()) throw new UnauthorizedException();
    await this.userService.killSessions(user.id, { except: [req.session.id] });
  }

  @Get('matches/:id')
  async findUsermatches(@Param('id') id: string): Promise<IUser | void> {
    return await this.userService.findUserMatches(id);
  }

  @Patch(':id/2fa')
  async twofactorEnable(
    @UserParam('id') user: IUserParam,
    @Req() req: Request,
  ): Promise<any> {
    if (!user.isSelf) throw new UnauthorizedException();
    const data = await this.userService.enableTwoFactor(user.id, req.session);
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

  // TODO returns full user
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
        destination: join(__dirname, '../../../uploads/'),
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
      await new Promise<void>((resolve, reject) => {
        unlink(
          join(__dirname, '../../../uploads/', user1.avatar),
          function (err) {
            if (err) reject(err);
            resolve();
          },
        );
      });
    }
  }
}
