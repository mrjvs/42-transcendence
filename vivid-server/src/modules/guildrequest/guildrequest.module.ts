import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildsEntity } from '~/models/guilds.entity';
import { GuildRequestEntity } from '~/models/guild_request.entity';
import { UserEntity } from '~/models/user.entity';
import { GuildsService } from '../guilds/guilds.service';
import { UserService } from '../users/user.service';
import { GuildrequestController } from './guildrequest.controller';
import { GuildRequestService } from './guildrequest.service';

@Module({
  imports: [TypeOrmModule.forFeature([GuildRequestEntity, GuildsEntity, UserEntity])],
  providers: [GuildsService, GuildRequestService, UserService],
  controllers: [GuildrequestController],
  exports: [GuildRequestService],
})
export class GuildrequestModule {}
