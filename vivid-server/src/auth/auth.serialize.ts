import { PassportSerializer } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/users/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject(UserService)
    private userService: UserService
  ) {
    super();
  }

  serializeUser(user: any, done: (err: Error, user: any) => void): any {
    console.log(user);
    done(null, user.id.toString());
  }

  deserializeUser(id: string, done: (err: Error, payload: string) => void): any {
    console.log("deserialize", id);
    this.userService.findUser(id)
    .then((user:any) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    })
  }
}