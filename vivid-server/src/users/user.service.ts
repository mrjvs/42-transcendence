import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from } from 'rxjs';
import { Repository } from 'typeorm';
import { UserEntity } from './models/user.entity';
import { IUser } from './models/user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  add(user: IUser): Observable<IUser> {
    return from(this.userRepository.save(user));
  }

  async findUser(id: string): Promise<UserEntity> {
    return await this.userRepository.findOne(id);
  }

  findAll(): Observable<IUser[]> {
    return from(this.userRepository.find());
  }

  deleteUser(id: string) {
    return this.userRepository.delete(id);
  }
}

/**
 * Add new user:
 *		- POST http:localhost:3000/api/v1/users
 * 		  body:
 * 			{
 * 				"id": number
 * 				"name": string
 * 			}
 *
 * Find user by id:
 *		- GET http:localhost:3000/api/v1/users/<id>
 *
 * Find all users:
 *		- GET http:localhost:3000/api/v1/users
 *
 * Delete user:
 *		- DELETE http:localhost:3000/api/v1/users/<id>
 *  */
