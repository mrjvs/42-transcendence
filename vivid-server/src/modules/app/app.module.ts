import { join } from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import configuration from '~/config/configuration';
import { TypeORMSession } from '@/session.entity';

import { UserModule } from '$/users/user.module';
import { ChannelModule } from '$/channels/channel.module';
import { AuthModule } from '$/auth/auth.module';
import { EventModule } from '$/websocket/event.module';
import { FriendsModule } from '$/friends/friends.module';
import { BlocksModule } from '$/blocks/blocks.module';
import { LadderModule } from '$/ladder/ladder.module';
import { MatchesModule } from '$/matches/matches.module';
import { DmModule } from '$/dm/dm.module';
import { StatsModule } from '$/stats/stats.module';

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
    LadderModule,
    MatchesModule,
    DmModule,
    StatsModule,

    // static
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'uploads'),
      serveRoot: '/cdn/avatars',
    }),
  ],
  controllers: [],
  providers: [],
  exports: [ConfigModule],
})
export class AppModule {}
