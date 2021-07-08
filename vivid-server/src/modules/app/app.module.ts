import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from '~/config/configuration';
import { UserModule } from '$/users/user.module';
import { WarsModule } from '~/modules/wars/wars.module';
import { ChannelModule } from '$/channels/channel.module';
import { AuthModule } from '$/auth/auth.module';
import { EventModule } from '$/websocket/event.module';
import { TypeORMSession } from '@/session.entity';
import { FriendsModule } from '$/friends/friends.module';
import { BlocksModule } from '$/blocks/blocks.module';
import { GuildsModule } from '$/guilds/guilds.module';
import { GuildrequestModule } from '$/guildrequest/guildrequest.module';
import { MatchesModule } from '../matches/matches.module';
import { ScheduleModule } from '@nestjs/schedule';

const config = ConfigModule.forRoot({
  load: [configuration],
});

@Module({
  imports: [
    // config & database
    config,
    TypeOrmModule.forRootAsync({
      imports: [config, ScheduleModule.forRoot()],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('db.host'),
        port: configService.get('db.port'),
        username: configService.get('db.user'),
        password: configService.get('db.password'),
        database: configService.get('db.database'),
        autoLoadEntities: true,
        entities: [TypeORMSession],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    // modules
    UserModule,
    ChannelModule,
    AuthModule,
    EventModule,
    FriendsModule,
    BlocksModule,
    WarsModule,
    GuildsModule,
    WarsModule,
    GuildrequestModule,
    MatchesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [ConfigModule],
})
export class AppModule {}
