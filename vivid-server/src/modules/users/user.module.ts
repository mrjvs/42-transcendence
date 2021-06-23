import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserEntity } from '@/user.entity';
import { UserController } from './user.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UserService, ConfigService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
