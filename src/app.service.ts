import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from './prisma/prisma.service';
import { randomize } from 'randomatic'

@Injectable()
export class AppService {
  constructor(private prismaService: PrismaService) {

  }
  getHello(): string {
    return 'Hello World!';
  }

  async generateURL(url: string) {
    function generateRandomURL(length: number) {
      let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      let shorten = ''; 
      for (let index = 0; index < length; index++) { 
        shorten += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return shorten; 
    }
  
    // const taken = await this.prismaService.user.findUnique({
    //   where: { shorten: randomURL }, 
    // });
  
    // if (taken) {
    //   return this.generateURL(link); 
    // }

    const shorten =  await this.prismaService.shorten.create({
      data: {shorten: generateRandomURL(4), link: url}
    })

    return shorten.shorten
  }
  
  async redirectToURL() {
    await this.prismaService.shorten.findFirst
  }
  

}
