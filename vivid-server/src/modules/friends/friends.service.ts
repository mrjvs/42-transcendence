import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { getConnection, Repository } from 'typeorm';
import { FriendsEntity } from '~/models/friends.entity';
import { UserEntity } from '~/models/user.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(FriendsEntity)
    private friendsRepository: Repository<FriendsEntity>,
  ) {}

  // Admin only, find all FriendsEntity's
  findAll(): Promise<FriendsEntity[]> {
    return this.friendsRepository.find();
  }

  // Add FriendEntity to database (=> send friend request)
  sendFriendRequest(
    user_1: string,
    user_2: string,
    requested_by: string,
  ): Observable<FriendsEntity | void> {
    return from(
      this.friendsRepository
        .save({
          user_1,
          user_2,
          requested_by,
        })
        .catch((error) => {
          // 23505 is thrown when duplicate key value violates unique constraint (friend request already exists)
          if (error.code === '23505') throw new BadRequestException();
        }),
    );
  }

  // Find user's pending friend requests (FriendsEntity's that aren't accepted)
  async findAllFriendRequests(userId: string): Promise<FriendsEntity[]> {
    let requests = await this.friendsRepository.find({
      where: {
        user_2: userId,
        accepted: false,
      },
    });
    return requests;
  }

  async getFriendIds(userId: string): Promise<string[]> {
    // Get all friendship Entities where user received the request
    let requests = await this.friendsRepository.find({
      where: {
        user_2: userId,
        accepted: true,
      },
    });

    // Save only friend ID's
    let names = requests.map((el) => el.user_1);

    // Get all friendship Entities where user sent the request
    requests = await this.friendsRepository.find({
      where: {
        user_1: userId,
        accepted: true,
      },
    });

    // Save only friend ID's and combine with others
    names.push(...requests.map((el) => el.user_2));
    return names;
  }

  // Update FriendsEntity to be accepted
  acceptFriendRequest(friendRequestId: string) {
    return this.friendsRepository.update(friendRequestId, { accepted: true });
  }

  // Find specific pending friend request
  async findFriendRequest(
    userId: string,
    friendId: string,
  ): Promise<FriendsEntity | undefined> {
    let found = await this.friendsRepository.findOne({
      where: {
        user_1: userId,
        user_2: friendId,
        accepted: false,
      },
    });
    return found;
  }

  // Find specific accepted FriendsEntity
  async findFriend(
    userId: string,
    friendId: string,
  ): Promise<FriendsEntity | undefined> {
    // Find accepted sent friend requests
    let found = await this.friendsRepository.findOne({
      where: {
        user_1: userId,
        user_2: friendId,
        accepted: true,
      },
    });

    // Find accepted received friend requests
    if (!found) {
      found = await this.friendsRepository.findOne({
        where: {
          user_1: friendId,
          user_2: userId,
          accepted: true,
        },
      });
    }
    return found;
  }

  // Delete FriendEntity from database (=> unfriend)
  unfriend(friendship: FriendsEntity): Promise<FriendsEntity> {
    return this.friendsRepository.remove(friendship);
  }
}
