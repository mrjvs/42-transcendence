import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '~/models/user.entity';
import { IUser } from '~/models/user.interface';
import { GuildsService } from '../guilds/guilds.service';

@Injectable()
export class UserSetupService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private configService: ConfigService,
    private guildsService: GuildsService,
  ) {}
}
