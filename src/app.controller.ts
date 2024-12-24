import { Body, Controller, Get, HttpException, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private userService: AppService) { }

  @Get()
  getHello(): string {
    return this.userService.getHello();
  }

  @Get('/api/generate/random')
  async generateURL(
    @Body('url') url: string
  ): Promise<any> {
    try {

      const shortenedLink = await this.userService.generateURL(url)
      console.log(`Create URL: http://localhost/${shortenedLink}`)
      return {
        message: `ShortenLink Telah dibuat`,
        shortenedLink: `http://localhost/${shortenedLink}`
      }
    } catch (error) {
      console.log(error.message)
      throw new HttpException(error.message, 500)
    }
  }

  @Get('/:shorten')
  async getURL(
    @Param('shorten') shortenLink,
    @Res() res: Response
  ): Promise<any> {
    try {

      const link = await this.userService.redirectToURL(shortenLink)
      return res.redirect(link.link)

    } catch (error) {
      console.log(error.message)
      throw new HttpException(error.message, 500)
    }
  }


}
