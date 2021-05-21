import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from } from 'rxjs';
import { Repository } from 'typeorm';
import { UserEntity } from './models/user.entity'
import { IUser } from './models/user.interface'

@Injectable()
export class UserService {

	constructor (
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>
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

	async findIntraUser(intraId: string): Promise<UserEntity> {
		return await this.userRepository.findOne({
			where: {
				intra_id: intraId,
			},
		});
	}
	
	async createUser(intraId: string): Promise<UserEntity> {
		const user: IUser = {
			id: 1234,
			name: "mrjvs",
			intra_id: intraId,
		}
		return await this.userRepository.save(user);
	}
}
