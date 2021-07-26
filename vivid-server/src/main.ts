import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '$/app/app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as passport from 'passport';
import * as session from 'express-session';
import { getSessionStore } from '$/auth/auth-session';
import { LadderService } from '$/ladder/ladder.service';

async function bootstrap() {
  if (!process.env.CORS) process.env.CORS = '';
  const app = await NestFactory.create(AppModule, {
    cors: {
      credentials: true,
      origin: process.env.CORS.split(' ').filter((v) => v.length > 0),
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
  const logger = new Logger('oauth');

  app.use(
    session({
      cookie: {
        maxAge: 24 * 7 * 60 * 60 * 1000, // 1 week
        httpOnly: false,
        secure: configService.get('useHttps'),
      },
      secret: configService.get('secrets.session'),
      name: configService.get('cookie.name'),
      resave: false,
      rolling: true,
      saveUninitialized: false,
      store: getSessionStore(),
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const ladderService = app.get(LadderService);
  await ladderService.generateDefaults();
  await app.listen(configService.get('port'));

  logger.log(
    `Enabled login methods: ${configService
      .get('oauth.validLogins')
      .join(', ')}`,
  );
  if (configService.get('oauth.validLogins').length < 1)
    logger.error(`No enabled login methods!`);
}
bootstrap();
