import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserEntity } from './models/user.entity';
import { UserController } from './user.controller';

@Module({
  imports: [
	  TypeOrmModule.forFeature([UserEntity])
  ],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
