import { PassportSerializer } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/users/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject(UserService)
    private readonly userService: UserService
  ) {
    super();
  }

  serializeUser(user: any, done: (err: Error, payload: string) => void): any {
    done(null, user.id.toString());
  }

  async deserializeUser(id: string, done: (err: Error, user: any) => void): Promise<any> {
    try {
      const user = await this.userService.findUser(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
}