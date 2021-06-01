import {
  Controller,
  Delete,
  Get,
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
// @UseGuards(AuthenticatedGuard)
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
    @Req() req: Request,
  ) {
    let friend = await this.userService.findUser(friendId);

    // checking if friend is in general user table
    if (!friend) {
      req.res.status(404).send('user not found');
      return;
    }

    // checking if friend is the logged in user
    if (user.id === friend.id) {
      req.res.status(404).send("can't be friends with ya self mate");
      return;
    }

    //checking if friend request has already been made or if they're already friends
    if (
      this.friendsService.findFriendRequest(user.id, friend.id) ||
      this.friendsService.findFriendRequest(friend.id, user.id) ||
      this.friendsService.findFriend(friend.id, user.id)
    ) {
      req.res.status(404).send('Friend request is already pending');
      return;
    }
    return this.friendsService.sendFriendRequest(user.id, friend.id);
  }

  // Find all pending friend requests
  @Get('requests')
  findRequests(@User() user: UserEntity): Promise<FriendsEntity[]> {
    return this.friendsService.findAllFriendRequests(user.id);
  }

  // Accept pending friend request
  @Patch('accept/:friend_id')
  async acceptRequest(
    @Param('friend_id') friendId: string,
    @User() user: UserEntity,
    @Req() req: Request,
  ) {
    // Search for friend request in database
    let friendRequest = await this.friendsService.findFriendRequest(
      user.id,
      friendId,
    );

    // Error if friend request isn't found
    if (!friendRequest) {
      req.res.status(404).send("Can't find friendrequest");
      return;
    }

    // Accept friend request if found
    return this.friendsService.acceptFriendRequest(friendRequest.id);
  }

  // Unfriend existing friend
  @Delete('unfriend/:friend_id')
  async unfriend(
    @Param('friend_id') friendId: string,
    @User() user: UserEntity,
    @Req() req: Request,
  ) {
    // checking for friend
    let friendship = await this.friendsService.findFriend(user.id, friendId);
    // Error if friendship isn't found
    if (!friendship) {
      req.res.status(404).send('Friendship not found');
      return;
    }
    return this.friendsService.unfriend(friendship);
  }

  // Decline friend request
  @Delete('decline/:friend_id')
  async declineFriendRequest(
    @Param('friend_id') friendId: string,
    @User() user: UserEntity,
    @Req() req: Request,
  ) {
    // checking for friend request
    let friendRequest = await this.friendsService.findFriendRequest(
      user.id,
      friendId,
    );
    // Error if friend request isn't found
    if (!friendRequest) {
      req.res.status(404).send('Friend request not found');
      return;
    }
    return this.friendsService.unfriend(friendRequest);
  }

  // Get full friendlist
  @Get('friendlist')
  async getFriendlist(@User() user: UserEntity): Promise<UserEntity[]> {
    // Get all friend ID's
    let friendIds = await this.friendsService.getFriendIds(user.id);

    // Get UserEntities for all friend ID's
    return (async () => {
      return Promise.all(friendIds.map((el) => this.userService.findUser(el)));
    })();
  }
}
