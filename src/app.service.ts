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

  async generateURL(link: string) {
    function generateRandomURL(length: number) {
      let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      let shorten = ''; 
      for (let index = 0; index < length; index++) { 
        shorten += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return shorten; 
    }
  
    const randomURL = generateRandomURL(4); 
    const taken = await this.prismaService.user.findUnique({
      where: { shorten: randomURL }, 
    });
  
    if (taken) {
      return this.generateURL(link); 
    }

    return await this.prismaService.user.create({
      data: {shorten: randomURL, link: link}
    })
  
  }
  

}
