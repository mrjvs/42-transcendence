import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '~/middleware/guards/auth.guards';
import { User } from '~/middleware/decorators/login.decorator';
import { UserEntity } from '@/user.entity';
import { UserService } from '$/users/user.service';
import { FriendsService } from './friends.service';
import { FriendsEntity } from '@/friends.entity';

@Controller('friends')
@UseGuards(AuthenticatedGuard)
export class FriendsController {
  constructor(
    private friendsService: FriendsService,
    private userService: UserService,
  ) {}

  // Send friend request
  @Post('add/:friend_id')
  async friendRequest(
    @Param('friend_id') friendId: string,
    @User() user: UserEntity,
  ): Promise<FriendsEntity> {
    // checking if friend is in general user table
    const friend = await this.userService.findUser(friendId);
    if (!friend) throw new NotFoundException();

    // checking if friend is the logged in user
    if (user.id === friend.id) throw new BadRequestException();

    return this.friendsService.sendFriendRequest(
      user.id,
      friend.id,
      user.id,
      friend.id,
    );
  }

  // Send friend request on username
  @Post('add-username/:friend_name')
  async friendRequestName(
    @Param('friend_name') friendName: string,
    @User() user: UserEntity,
  ): Promise<FriendsEntity> {
    // checking if friend is in general user table
    const friend = await this.userService.findUserName(friendName);
    if (!friend) throw new NotFoundException();

    // checking if friend is the logged in user
    if (user.id === friend.id) throw new BadRequestException();

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
    return this.friendsService.findFriendRequests(user.id);
  }

  // Accept pending friend request
  @Patch('accept/:friend_id')
  async acceptRequest(
    @Param('friend_id') friendId: string,
    @User() user: UserEntity,
  ): Promise<FriendsEntity> {
    return this.friendsService.acceptFriendRequest(user.id, friendId);
  }

  // Unfriend existing friend
  @Delete('unfriend/:friend_id')
  async unfriend(
    @Param('friend_id') friendId: string,
    @User() user: UserEntity,
  ): Promise<FriendsEntity> {
    return this.friendsService.deleteFriendship(user.id, friendId);
  }

  // Get full friendlist
  @Get('friendlist')
  async getFriendlist(@User() user: UserEntity): Promise<UserEntity[]> {
    return await this.friendsService.getFriendList(user.id);
  }
}
