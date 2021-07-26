import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { FriendsEntity } from '@/friends.entity';
import { UserEntity } from '@/user.entity';
import { EventGateway } from '../websocket/event.gateway';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(FriendsEntity)
    private friendsRepository: Repository<FriendsEntity>,
    private eventGateway: EventGateway,
  ) {}

  async findFriendship(user_1: string, user_2: string): Promise<FriendsEntity> {
    if (user_2 < user_1) {
      const tmp = user_1;
      user_1 = user_2;
      user_2 = tmp;
    }

    return await this.friendsRepository.findOne({
      relations: ['user_1', 'user_2'],
      where: {
        user_1,
        user_2,
      },
    });
  }

  async findFriendRequests(userId: string): Promise<FriendsEntity[]> {
    return await this.friendsRepository
      .createQueryBuilder('friends')
      .leftJoinAndSelect('friends.user_1', 'user_1')
      .leftJoinAndSelect('friends.user_2', 'user_2')
      .where('user_1 = :u1', { u1: userId })
      .orWhere('user_2 = :u2', { u2: userId })
      .getMany();
  }

  // Add FriendEntity to database (=> send friend request)
  async sendFriendRequest(
    user_1: string,
    user_2: string,
    requested_by: string,
    requested_to: string,
  ): Promise<FriendsEntity> {
    //putting the lower id in first column to be able to check unique combination
    if (user_2 < user_1) {
      const tmp = user_1;
      user_1 = user_2;
      user_2 = tmp;
    }
    await this.friendsRepository
      .createQueryBuilder()
      .insert()
      .values({
        user_1: user_1,
        user_2: user_2,
        requested_by: requested_by,
        requested_to: requested_to,
      })
      .execute()
      .catch((error) => {
        if (error.code === '23505') throw new BadRequestException();
        throw error;
      });
    const friendship = await this.findFriendship(user_1, user_2);
    this.eventGateway.updateFriendships(friendship);
    return friendship;
  }

  async getFriend(user1: string, user2: string): Promise<FriendsEntity> {
    const tmp = user1;
    if (user1 > user2) {
      user1 = user2;
      user2 = tmp;
    }

    return await this.friendsRepository.findOne({
      user_1: user1,
      user_2: user2,
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
          .where('user_1 = :u OR user_2 = :u', { u: userId }) // andWhere?
          .andWhere('accepted = :a', { a: true });
      }, 'f')
      .leftJoinAndSelect('', 'users', 'users.id = f.friends::uuid')
      .execute();
  }

  // Update FriendsEntity to be accepted
  async acceptFriendRequest(
    userId: string,
    friendId: string,
  ): Promise<FriendsEntity> {
    const friendship = await this.findFriendship(userId, friendId);
    await this.friendsRepository
      .createQueryBuilder()
      .update()
      .set({ accepted: true })
      .where('id = :id', { id: friendship.id })
      .execute()
      .catch((error) => {
        if (error.code === '22P02') throw new NotFoundException();
        throw error;
      });
    friendship.accepted = true;
    this.eventGateway.updateFriendships(friendship);
    return friendship;
  }

  // deleting the friendship or decline friendrequest
  async deleteFriendship(
    userId: string,
    friendId: string,
  ): Promise<FriendsEntity> {
    const friendship = await this.findFriendship(userId, friendId);

    await this.friendsRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id: friendship.id })
      .execute()
      .catch((error) => {
        if (error.code === '22P02') throw new NotFoundException();
        throw error;
      });
    this.eventGateway.removeFriendships(friendship);
    return friendship;
  }
}
