import { Controller, Get, Req, Res } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Request, Response } from 'express';
import { WarsService } from '../wars/wars.service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor
  (
    private readonly appService: AppService, 
    private warsService: WarsService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Cron('*/20 * * * * *')
  runEvery10Seconds() {
    console.log('Every 20 seconds');
    // const currentDate = new Date();
    // console.log(currentDate);
    // this.warsService.checkWars(currentDate.toISOString());
  }

  // @Get('pong')
  // get(@Res() res: Response) {
  //   res.sendFile('index.html', {
  //     root: 'src/modules/pong/',
  //   });
  // }
}
