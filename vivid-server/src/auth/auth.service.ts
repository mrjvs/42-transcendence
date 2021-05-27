import { Injectable, Inject } from '@nestjs/common';
import { UserService } from 'src/users/user.service';

@Injectable()
export class AuthService {
    constructor(
        @Inject(UserService)
		private userService: UserService
	) {}

    async validateUser(intraId: string): Promise<any> {
		let user = await this.userService.findIntraUser(intraId);

		if (!user) {
            user = await this.userService.createUser(intraId);
		}

		return user;
	}
}
