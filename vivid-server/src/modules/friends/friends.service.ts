import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
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
    return await this.friendsRepository.find({
      relations: ['user_1', 'user_2'],
      where: {
        requested_to: userId,
        accepted: false,
      },
    });
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
    return await this.findFriendship(user_1, user_2);
  }

  // find all friends of the user
  // TODO also filters when accepted = false
  // TODO Are we using this function?
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
    return friendship;
  }
}
