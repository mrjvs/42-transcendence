import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildsEntity } from '@/guilds.entity';
import { GuildRequestEntity } from '@/guild_request.entity';
import { UserEntity } from '@/user.entity';
import { GuildsService } from '$/guilds/guilds.service';
import { UserService } from '$/users/user.service';
import { GuildrequestController } from './guildrequest.controller';
import { GuildRequestService } from './guildrequest.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([GuildRequestEntity, GuildsEntity, UserEntity]),
  ],
  providers: [GuildsService, GuildRequestService, UserService, ConfigService],
  controllers: [GuildrequestController],
  exports: [GuildRequestService],
})
export class GuildrequestModule {}
