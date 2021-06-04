import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { FriendsEntity } from '@/friends.entity';

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
    return await this.friendsRepository
      .createQueryBuilder()
      .select()
      .where('requested_to = :r', { r: userId })
      .andWhere('accepted = :a', { a: false })
      .execute();
  }

  // find all friends of the user
  async getFriendList(userId: string) {
    return await getConnection()
      .createQueryBuilder()
      .select()
      .from((el) => {
        return el
          .select(
            `CASE  WHEN user_1 = '${userId}' THEN user_2 
                   WHEN user_2 = '${userId}' THEN user_1 
            END`,
            'friends',
          )
          .from(FriendsEntity, 'f')
          .where('accepted = :a', { a: true });
      }, 'f')
      .leftJoinAndSelect('users', 'users', 'users.id = f.friends::uuid')
      .execute();
  }

  // Update FriendsEntity to be accepted
  async acceptFriendRequest(userId: string, friendRequestId: string) {
    return await this.friendsRepository
      .createQueryBuilder()
      .update()
      .set({ accepted: true })
      .where('id = :id', { id: friendRequestId })
      .andWhere('requested_to = :r', { r: userId })
      .execute()
      .catch((error) => {
        if ((error.code = '22P02')) throw new NotFoundException();
      });
  }
  // deleting the friendship or decline friendrequest
  async deleteFriendship(userId: string, friendRequestId: string) {
    return await this.friendsRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id: friendRequestId })
      .andWhere('user_1 = :u1 OR user_2 = :u2', {
        u1: userId,
        u2: userId,
      })
      .execute()
      .catch((error) => {
        if ((error.code = '22P02')) throw new NotFoundException();
      });
  }
}
