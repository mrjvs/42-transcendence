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
  ): Promise<Observable<FriendsEntity>> {

    let found = await this.friendsRepository.findOne({
      where: {
        id_request: userId,
        id_accept: friendId,
      },
    });
    
    if (found) return;

    return from(
      this.friendsRepository.save({
        id_request: userId,
        id_accept: friendId,
      }),
    );
  }
}
