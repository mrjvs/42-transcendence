import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildsController } from './guilds.controller';
import { GuildsService } from './guilds.service';
import { GuildsEntity } from '@/guilds.entity';
import { UserModule } from '../users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GuildsEntity]),
    forwardRef(() => UserModule),
  ],
  providers: [GuildsService],
  controllers: [GuildsController],
  exports: [GuildsService],
})
export class GuildsModule {}
