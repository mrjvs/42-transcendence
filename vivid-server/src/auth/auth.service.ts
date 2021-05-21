import { Injectable, Inject, Dependencies } from '@nestjs/common';
import { UserService } from 'src/users/user.service';

@Injectable()
@Dependencies(UserService)
export class AuthService {
    constructor(
        @Inject(UserService)
		private userService: UserService
	) {}

    async findUserFromIntraId(intraId: string): Promise<any> {
		let user = await this.userService.findIntraUser(intraId);

		if (!user) {
            user = await this.userService.createUser(intraId);
		}

		return user;
	}
}
