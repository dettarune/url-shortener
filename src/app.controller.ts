import { Body, Controller, Get, HttpException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private userService: AppService) {}

  @Get()
  getHello(): string {
    return this.userService.getHello();
  }

  @Get('/generate/random')
  
  async generateURL(
    @Body() url: string
  ): Promise<any>{
    try {

      const shortenedLink = await this.userService.generateURL(url)
      return {
        message: `ShortenLink Telah dibuat`,
        shortenedLink: `http://localhost/${shortenedLink}`
      }
    } catch (error) {
      console.log(error.message)
      throw new HttpException(error.message, 500)
    }
  }
}
