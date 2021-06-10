import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/user.entity';
import { UserService } from '$/users/user.service';
import { GuildsController } from './guilds.controller';
import { GuildsService } from './guilds.service';
import { GuildsEntity } from '@/guilds.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GuildsEntity, UserEntity])],
  providers: [GuildsService, UserService],
  controllers: [GuildsController],
  exports: [GuildsService],
})
export class GuildsModule {}
