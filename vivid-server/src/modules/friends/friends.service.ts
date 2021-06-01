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

  async findAll(): Promise<FriendsEntity[]> {
    return await this.friendsRepository.find();
  }

  async friendRequest(
    userId: string,
    friendId: string,
  ): Promise<Observable<FriendsEntity>> 
  {
    let found = await this.friendsRepository.findOne({
      where: {
        id_request: userId,
        id_accept: friendId,
      }, // let's not forget about when the friend request was already made in the different direction
    });

    if (found)
      return ;

    return from(
      this.friendsRepository.save({
        id_request: userId,
        id_accept: friendId,
      }),
    );
  }

  async findRequests(
    userId: string)
    :Promise<FriendsEntity[]>
  {
    let requests =  await this.friendsRepository.find({
      where: {
        id_accept: userId,
        accepted: false,
      },
    });
    console.log(requests);
    return requests;
  }

  async acceptRequest(
    userId: string,
    friendId: string,
  )
  {
    let found = await this.friendsRepository.findOne({
      where: {
        id_request: friendId,
        id_accept: userId,
        accepted: false
      },
    });
    if (!found)
      return ;
    this.friendsRepository.update(found.id, {accepted: true});

  }
}
