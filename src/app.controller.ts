import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private userService: AppService) {}

  @Get()
  getHello(): string {
    return this.userService.getHello();
  }

  @Get('/generate/random')
  generateURL(){
    try {
      this.userService.generateURL('http://youtube.com')
    } catch (error) {
      
    }
  }
}
