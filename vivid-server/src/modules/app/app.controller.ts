import { Controller, Get, Req, Res } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Cron('*/10 * * * * *')
  runEvery10Seconds() {
    console.log('Every 10 seconds');
  }

  // @Get('pong')
  // get(@Res() res: Response) {
  //   res.sendFile('index.html', {
  //     root: 'src/modules/pong/',
  //   });
  // }
}
