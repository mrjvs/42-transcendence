import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlocksEntity } from '@/blocks.entity';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';
import { UserModule } from '$/users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlocksEntity]),
    forwardRef(() => UserModule),
  ],
  providers: [BlocksService],
  controllers: [BlocksController],
  exports: [BlocksService],
})
export class BlocksModule {}
