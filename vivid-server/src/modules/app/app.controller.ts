import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Get('pong')
  // get(@Res() res: Response) {
  //   res.sendFile('index.html', {
  //     root: 'src/modules/pong/',
  //   });
  // }
}
