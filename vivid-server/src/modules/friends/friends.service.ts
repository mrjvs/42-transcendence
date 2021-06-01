import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { FriendsEntity } from '~/models/friends.entity';
import { UserEntity } from '~/models/user.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(FriendsEntity)
    private friendsRepository: Repository<FriendsEntity>,
  ) {}

  // Admin only, find all FriendsEntity's
  async findAll(): Promise<FriendsEntity[]> {
    return await this.friendsRepository.find();
  }

  // Add FriendEntity to database (=> send friend request)
  async sendFriendRequest(
    userId: string,
    friendId: string,
  ): Promise<Observable<FriendsEntity>> {
    return from(
      this.friendsRepository.save({
        id_request: userId,
        id_accept: friendId,
      }),
    );
  }

  // Find user's pending friend requests (FriendsEntity's that aren't accepted)
  async findAllFriendRequests(userId: string): Promise<FriendsEntity[]> {
    let requests = await this.friendsRepository.find({
      where: {
        id_accept: userId,
        accepted: false,
      },
    });
    return requests;
  }

  async getFriendIds(userId: string): Promise<string[]> {
    // Get all friendship Entities where user received the request
    let requests = await this.friendsRepository.find({
      where: {
        id_accept: userId,
        accepted: true,
      },
    });

    // Save only friend ID's
    let names = requests.map((el) => el.id_request);

    // Get all friendship Entities where user sent the request
    requests = await this.friendsRepository.find({
      where: {
        id_request: userId,
        accepted: true,
      },
    });

    // Save only friend ID's and combine with others
    names.push(...requests.map((el) => el.id_accept));
    return names;
  }

  // Update FriendsEntity to be accepted
  async acceptFriendRequest(friendRequestId: string) {
    return this.friendsRepository.update(friendRequestId, { accepted: true });
  }

  // Find specific pending friend request
  async findFriendRequest(
    userId: string,
    friendId: string,
  ): Promise<FriendsEntity | undefined> {
    let found = await this.friendsRepository.findOne({
      where: {
        id_request: userId,
        id_accept: friendId,
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
        id_request: userId,
        id_accept: friendId,
        accepted: true,
      },
    });

    // Find accepted received friend requests
    if (!found) {
      found = await this.friendsRepository.findOne({
        where: {
          id_request: friendId,
          id_accept: userId,
          accepted: true,
        },
      });
    }
    return found;
  }

  // Delete FriendEntity from database (=> unfriend)
  async unfriend(friendship: FriendsEntity): Promise<FriendsEntity> {
    return this.friendsRepository.remove(friendship);
  }
}
