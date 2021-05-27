import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from '~/config/configuration';

import { UserModule } from '$/users/user.module';
import { ChannelModule } from '$/channels/channel.module';
import { AuthModule } from '$/auth/auth.module';

const config = ConfigModule.forRoot({
  load: [configuration],
});

@Module({
  imports: [
    // config & database
    config,
    TypeOrmModule.forRootAsync({
      imports: [config],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('db.host'),
        port: configService.get('db.port'),
        username: configService.get('db.user'),
        password: configService.get('db.password'),
        database: configService.get('db.database'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    // modules
    UserModule,
    ChannelModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [ConfigModule],
})
export class AppModule {}
