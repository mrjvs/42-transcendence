import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildRequestEntity } from '@/guild_request.entity';
import { GuildrequestController } from './guildrequest.controller';
import { GuildRequestService } from './guildrequest.service';
import { UserModule } from '../users/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GuildRequestEntity]),
    forwardRef(() => UserModule),
  ],
  providers: [GuildRequestService],
  controllers: [GuildrequestController],
  exports: [GuildRequestService],
})
export class GuildrequestModule {}
