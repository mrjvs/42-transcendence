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


   getFriendList(userId: string){
     return await getConnection()
     .createQueryBuilder()
     .select()
     .from(el => {
       return el
       .select("(CASE WHEN (user_1 = '745ac7e7-6587-414e-b5e1-01245653ac6e') THEN user_2" + 
       " WHEN (user_2 = '745ac7e7-6587-414e-b5e1-01245653ac6e') THEN user_1" + 
       " END as friends)")
       .from(FriendsEntity, "f")
       .where('accepted = :accepted', { accepted: true});
     }, "a")
     .leftJoinAndSelect()
     .set({ accepted: true })
     .where('id = :id', { id: friendRequestId })
     .andWhere('requested_to = :accept', { accept: userId })
     .execute();
     
     
    //  connection.getRepository(Customer).createQueryBuilder("customer")
    //  .select(["customer.CustomerName", "customer.City", "customer.Country"])
    //  .orderBy("(CASE WHEN customer.City IS NULL THEN customer.Country ELSE customer.City END)")
    //  .getMany();
   }


   SELECT 
	*
	FROM (
		SELECT 
			CASE 
				WHEN (user_1 = '745ac7e7-6587-414e-b5e1-01245653ac6e') THEN user_2
				WHEN (user_2 = '745ac7e7-6587-414e-b5e1-01245653ac6e') THEN user_1
			END as friends
			FROM friends f
				WHERE accepted = false
		) a 
		JOIN users u
			ON u.id = a.friends::uuid

  //   SELECT 
  //     *
  //     FROM friends f

  // async getFriendIds(userId: string): Promise<string[]> {
  //   // Get all friendship Entities where user received the request
  //   let requests = await this.friendsRepository.find({
  //     where: {
  //       id_accept: userId,
  //       accepted: true,
  //     },
  //   });

  //   // Save only friend ID's
  //   let names = requests.map((el) => el.id_request);

  //   // Get all friendship Entities where user sent the request
  //   requests = await this.friendsRepository.find({
  //     where: {
  //       id_request: userId,
  //       accepted: true,
  //     },
  //   });

  //   // Save only friend ID's and combine with others
  //   names.push(...requests.map((el) => el.id_accept));
  //   return names;
  // }

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

    // return await getConnection()
    //   .createQueryBuilder()
    //   .delete()
    //   .from(FriendsEntity)
    //   .where('id = :id', { id: friendRequestId })
    //   .andWhere('user_1 = :user_1 OR user_2 = :user_2', {
    //     user_1: userId,
    //     user_2: userId,
    //   })
    //   .execute();

    // return this.friendsRepository.update(friendRequestId, userId, { accepted: true });
  }

  // // Find specific pending friend request
  // async findFriendRequest(
  //   userId: string,
  //   friendId: string,
  // ): Promise<FriendsEntity | undefined> {
  //   let found = await this.friendsRepository.findOne({
  //     where: {
  //       id_request: userId,
  //       id_accept: friendId,
  //     },
  //   });
  //   return found;
  // }

  // findFriendOrRequest(userId: string, friendId: string) {
  //   let found = this.friendsRepository.findOne({
  //     where:
  //       ({
  //         id_request: userId,
  //       } && {
  //         id_accept: friendId,
  //       }) ||
  //       ({
  //         id_request: friendId,
  //       } && {
  //         id_accept: userId,
  //       }),
  //   });
  //   if (found === undefined) {
  //     console.log(found);
  //     console.log('ik return 0');

  //     return false;
  //   }
  //   return true;
  // }

  // // Find specific accepted FriendsEntity
  // async findFriend(
  //   userId: string,
  //   friendId: string,
  // ): Promise<FriendsEntity | undefined> {
  //   // Find accepted sent friend requests
  //   let found = await this.friendsRepository.findOne({
  //     where: {
  //       id_request: userId,
  //       id_accept: friendId,
  //       accepted: true,
  //     },
  //   });

  //   // Find accepted received friend requests
  //   if (!found) {
  //     found = await this.friendsRepository.findOne({
  //       where: {
  //         id_request: friendId,
  //         id_accept: userId,
  //         accepted: true,
  //       },
  //     });
  //   }
  //   return found;
  // }

  // // Delete FriendEntity from database (=> unfriend)
  // async unfriend(friendship: FriendsEntity): Promise<FriendsEntity> {
  //   return this.friendsRepository.remove(friendship);
  // }
}
