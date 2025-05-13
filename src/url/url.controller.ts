import { Body, Controller, Get, HttpException, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { UrlService } from './url.service';
import { UserGuard } from 'src/auth/auth.guard';
import { Request } from 'express';

@Controller()
export class UrlController {
  constructor(private userService: UrlService) { }

  @Get()
  getHello(): string {
    return this.userService.getHello();
  }

  @UseGuards(UserGuard)
  @Post('/api/smallin/generate')
  async generateURL(
    @Body('url') url: string,
    @Req() req: Request,
    @Body('customURL') customURL?: string,
  ): Promise<any> {
    try {
      const userId = req.user?.id;  

      let shortenedURL;

      if (!customURL) {
        shortenedURL = await this.userService.generateURL(url, userId);
      } else {
        shortenedURL = await this.userService.generateCustomURL(customURL, url, userId);
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

  @Get('/:shortened')
  async getURL(
    @Param('shortened') shortenedLink,
    @Res() res: Response
  ): Promise<any> {
    try {
      const link = await this.userService.redirectToURL(shortenedLink);
      return res.redirect(link.link);
    } catch (error) {
      console.log(error.message);
      throw new HttpException(error.message, 500);
    }
  }
}
