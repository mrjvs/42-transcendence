import {
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { User } from '~/middleware/decorators/login.decorator';
import { UserEntity } from '~/models/user.entity';
import { UserService } from '../users/user.service';
import { FriendsService } from './friends.service';
import { FriendsEntity } from '~/models/friends.entity';
import { Observable } from 'rxjs';

@Controller('friends')
@UseGuards(AuthenticatedGuard)
export class FriendsController {
  constructor(
    private friendsService: FriendsService,
    private userService: UserService,
  ) {}

  // @MustbeAdmin()
  @Get('all')
  findAll(): Promise<FriendsEntity[]> {
    return this.friendsService.findAll();
  }


  @Post('add/:friend_id')
  async friendRequest(
    @Param('friend_id') friendId: string,
    @User() user: UserEntity,
    @Res() response: Response,
  ) {
    let friend = await this.userService.findUser(friendId);

    // checking if friend is in general user table
    if (!friend) {
      response.status(404).send('user not found');
      throw 'error';
    }
    
    // checking if friend is the logged in user
    if (user.id === friend.id) {
      response.status(404).send("can't be friends with ya self mate");
      throw 'error';
    }
    
    //checking if friend request has already been made
    
    response.status(201).send('all good');
    console.log(this.friendsService.friendRequest(user.id, friend.id));
    // if (!(this.friendsService.friendRequest(user.id, friend.id))) // dit werkt niet
    //   response.status(404).send("This request was already made"); 
    return ;
  }
  
  @Get('requests')
  findRequests(
    @User() user: UserEntity,)
    : Promise<FriendsEntity[]> 
    {
      return this.friendsService.findRequests(user.id);
    }
    
    @Patch('accept/:friend_id')
    async acceptRequest(
      @Param('friend_id') friendId: string,
      @User() user: UserEntity,
      @Res() response: Response,
      )
    {
      let friend = await this.userService.findUser(friendId);
             // checking if friend is in general user table
      if (!friend) {
        response.status(404).send('user not found');
        throw 'error';
      }
        response.status(201).send('all good');
        return this.friendsService.acceptRequest(user.id, friend.id);
    }
}
