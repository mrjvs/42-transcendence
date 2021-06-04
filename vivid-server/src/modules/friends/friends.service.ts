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
  async findAll(): Promise<FriendsEntity[]> {
    return await this.friendsRepository.find();
  }

  // Add FriendEntity to database (=> send friend request)
  async sendFriendRequest(
    user_1: string,
    user_2: string,
    requested_by: string,
    requested_to: string,
  ) {
    return await this.friendsRepository
      .createQueryBuilder()
      .insert()
      .values([
        {
          user_1: user_1,
          user_2: user_2,
          requested_by: requested_by,
          requested_to: requested_to,
        },
      ])
      .execute()
      .catch((error) => {
        if ((error.code = '23505')) throw new BadRequestException();
      });
  }

  // Find user's pending friend requests (FriendsEntity's that aren't accepted)
  async findAllFriendRequests(userId: string): Promise<FriendsEntity[]> {
    let requests = await this.friendsRepository.find({
      where: {
        requested_to: userId,
        accepted: false,
      },
    });
    return requests;
  }

  // find all friends of the user
  async getFriendList(userId: string) {
    return await getConnection()
      .createQueryBuilder()
      .select()
      .from((el) => {
        return el
          .select(
            `CASE  WHEN user_1 = '` + userId +  `' THEN user_2 
                   WHEN user_2 = '` + userId +  `' THEN user_1 
            END`,
            'friends',
          )
          .from(FriendsEntity, 'f')
          .where('accepted = :accepted', { accepted: true });
      }, 'f')
      .leftJoinAndSelect('users', 'user', 'user.id = f.friends::uuid')
      .execute();
  }

  // Update FriendsEntity to be accepted
  async acceptFriendRequest(userId: string, friendRequestId: string) {
    return await this.friendsRepository
      .createQueryBuilder()
      .update()
      .set({ accepted: true })
      .where('id = :id', { id: friendRequestId })
      .andWhere('requested_to = :accept', { accept: userId })
      .execute();
    // return this.friendsRepository.update(friendRequestId, userId, { accepted: true });
  }

  async deleteFriendship(userId: string, friendRequestId: string) {
    return await this.friendsRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id: friendRequestId })
      .andWhere('user_1 = :user_1 OR user_2 = :user_2', {
        user_1: userId,
        user_2: userId,
      })
      .execute();
  }
}
