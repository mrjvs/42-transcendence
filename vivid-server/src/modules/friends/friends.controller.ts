import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
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

  // Send friend request
  @Post('add/:friend_id')
  async friendRequest(
    @Param('friend_id') friendId: string,
    @User() user: UserEntity,
  ) {
    // checking if friend is in general user table
    let friend = await this.userService.findUser(friendId);
    if (!friend) throw new NotFoundException();

    // checking if friend is the logged in user
    if (user.id === friend.id)
      throw new BadRequestException();

    //checking if friend request has already been made or if they're already friends
    if (user.id < friend.id)
      return this.friendsService.sendFriendRequest(
        user.id,
        friend.id,
        user.id,
        friend.id,
      );
    return this.friendsService.sendFriendRequest(
      user.id,
      friend.id,
      user.id,
      friend.id,
    );
  }

  // Find all pending friend requests
  @Get('requests')
  findRequests(@User() user: UserEntity): Promise<FriendsEntity[]> {
    return this.friendsService.findAllFriendRequests(user.id);
  }

  // Accept pending friend request
  @Patch('accept/:friendrequest_id')
  async acceptRequest(
    @Param('friendrequest_id') friendRequestId: string,
    @User() user: UserEntity,
  ) {
    // Accept friend request if found
    return this.friendsService.acceptFriendRequest(
      '6ff43c83-2192-408b-9be1-f573422c6766',
      friendRequestId,
    );
  }

  // Unfriend existing friend
  @Delete('unfriend/:friendrequest_id')
  async unfriend(
    @Param('friendrequest_id') friendRequestId: string,
    @User() user: UserEntity,
  ) {
    // checking for friend
    // let friendship = await this.friendsService.findFriend(user.id, friendId);
    // Error if friendship isn't found
    // if (!friendship) {
    //   req.res.status(404).send('Friendship not found');
    //   return;
    // }
    return this.friendsService.deleteFriendship(user.id, friendRequestId);
  }

  // // Decline friend request
  // @Delete('decline/:friend_id')
  // async declineFriendRequest(
  //   @Param('friend_id') friendId: string,
  //   @User() user: UserEntity,
  //   @Req() req: Request,
  // ) {
  //   // checking for friend request
  //   let friendRequest = await this.friendsService.findFriendRequest(
  //     user.id,
  //     friendId,
  //   );
  //   // Error if friend request isn't found
  //   if (!friendRequest) {
  //     req.res.status(404).send('Friend request not found');
  //     return;
  //   }
  //   return this.friendsService.unfriend(friendRequest);
  // }

  // Get full friendlist
  @Get('friendlist')
  async getFriendlist(
    @User() user: UserEntity)
    : Promise<UserEntity[]> {


    return this.friendsService.getFriendList(user.id);
    // Get all friend ID's
    // let friendIds = await this.friendsService.getFriendIds(user.id);

    // Get UserEntities for all friend ID's
    // return (async () => {
    //   return Promise.all(friendIds.map((el) => this.userService.findUser(el)));
    // })();
  }
}
