import { Body, Controller, Get, HttpException, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './token.service';

@Controller()
export class AppController {
  constructor(private userService: AppService) { }

  @Get()
  getHello(): string {
    return this.userService.getHello();
  }

  @Post('/api/token/')
  async generateURL(
    @Body('url') url: string,
    @Body('customURL') customURL?: string,
  ): Promise<any> {
    try {

      let shortenedURL;

      if(!customURL){
        shortenedURL = await this.userService.generateURL(url)
      } else {
        shortenedURL = await this.userService.generateCustomURL(customURL, url)
      }

      return {
        message: `ShortenedLink Telah dibuat`,
        shortenedLink: `http://localhost:3000/${shortenedURL}`
      };

    } catch (error) {
      console.log(error.message);
      throw new HttpException(error.message, 500);
    }
  }

  // ini depannya bakal localhost:3000 (baseURL)
  @Get('/:shortened')
  async getURL(
    @Param('shortened') shortenedLink,
    @Res() res: Response
  ): Promise<any> {
    try {

      const link = await this.userService.redirectToURL(shortenedLink)
      return res.redirect(link.link)

    } catch (error) {
      console.log(error.message)
      throw new HttpException(error.message, 500)
    }
  }

}
