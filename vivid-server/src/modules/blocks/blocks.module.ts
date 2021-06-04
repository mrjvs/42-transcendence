import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlocksEntity } from '@/blocks.entity';
import { UserEntity } from '@/user.entity';
import { UserService } from '$/users/user.service';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';

@Module({
  imports: [TypeOrmModule.forFeature([BlocksEntity, UserEntity])],
  providers: [BlocksService, UserService],
  controllers: [BlocksController],
  exports: [BlocksService],
})
export class BlocksModule {}
