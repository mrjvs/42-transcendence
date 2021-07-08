import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserEntity } from '@/user.entity';
import { UserController } from './user.controller';
import { ConfigService } from '@nestjs/config';
import { UserSetupController } from './user_setup.controller';
import { GuildsModule } from '../guilds/guilds.module';
import { WarsModule } from '../wars/wars.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), GuildsModule, WarsModule],
  providers: [UserService, ConfigService],
  controllers: [UserController, UserSetupController],
  exports: [UserService],
})
export class UserModule {}
