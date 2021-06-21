import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '$/app/app.module';
import { ValidationPipe } from '@nestjs/common';
import * as passport from 'passport';
import * as session from 'express-session';
import { getRepository } from 'typeorm';
import { TypeORMSession } from '@/session.entity';
import { TypeormStore } from 'connect-typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      credentials: true,
      origin: ['http://localhost:3000'], // TODO add to config
    },
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  const configService = app.get(ConfigService);
  const sessionRepo = getRepository(TypeORMSession);

  app.use(
    session({
      cookie: {
        maxAge: 24 * 7 * 60 * 60 * 1000, // 1 week
        httpOnly: false,
        secure: configService.get('useHttps'),
      },
      secret: configService.get('secrets.session'),
      name: 'vivid.login',
      resave: false,
      rolling: true,
      saveUninitialized: false,
      store: new TypeormStore({
        cleanupLimit: 42,
      }).connect(sessionRepo),
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(configService.get('port'));
}
bootstrap();
