import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
// import { Cron } from '@nestjs/schedule';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Cron('*/30 * * * * *')
  // runEvery10Seconds() {
  //   console.log('Every 30 seconds');
  // }
}
