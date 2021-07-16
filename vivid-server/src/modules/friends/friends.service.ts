import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  getConnection,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { FriendsEntity } from '@/friends.entity';
import { UserEntity } from '@/user.entity';

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
    user_1: UserEntity,
    user_2: UserEntity,
    requested_by: UserEntity,
    requested_to: UserEntity,
  ): Promise<InsertResult> {
    //putting the lower id in first column to be able to check unique combination
    if (user_2 < user_1) {
      const tmp = user_1;
      user_1 = user_2;
      user_2 = tmp;
    }
    return this.friendsRepository
      .createQueryBuilder()
      .insert()
      .values({
        user_1: user_1.id,
        user_2: user_2.id,
        requested_by: requested_by.id,
        requested_to: requested_to.id,
      })
      .execute()
      .catch((error) => {
        if (error.code === '23505') throw new BadRequestException();
        throw error;
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
  async getFriendList(userId: string): Promise<UserEntity[]> {
    return await getConnection()
      .createQueryBuilder()
      .select()
      .from((el) => {
        return el
          .select(
            `CASE WHEN user_1 = :u THEN user_2 
        			WHEN user_2 = :u THEN user_1 
        			END`,
            'friends',
          )
          .setParameter('u', userId)
          .from(FriendsEntity, 'f')
          .where('user_1 = :u OR user_2 = :u', { u: userId })
          .andWhere('accepted = :a', { a: true });
      }, 'f')
      .leftJoinAndSelect('users', 'users', 'users.id = f.friends::uuid')
      .execute();
  }

  // Update FriendsEntity to be accepted
  async acceptFriendRequest(
    userId: string,
    friendId: string,
  ): Promise<UpdateResult> {
    return await this.friendsRepository
      .createQueryBuilder()
      .update()
      .set({ accepted: true })
      .where('requested_by = :f', { f: friendId })
      .andWhere('requested_to = :u', { u: userId })
      .execute()
      .catch((error) => {
        if (error.code === '22P02') throw new NotFoundException();
        throw error;
      });
  }

  // deleting the friendship or decline friendrequest
  async deleteFriendship(
    userId: string,
    friendId: string,
  ): Promise<DeleteResult> {
    return await this.friendsRepository
      .createQueryBuilder()
      .delete()
      .where('user_1 = :u1 AND user_2 = :u2', {
        u1: userId,
        u2: friendId,
      })
      .orWhere('user_1 = :u3 AND user_2 = :u4', {
        u3: friendId,
        u4: userId,
      })
      .execute()
      .catch((error) => {
        if (error.code === '22P02') throw new NotFoundException();
        throw error;
      });
  }
}
