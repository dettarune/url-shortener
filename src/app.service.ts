import { HttpException, Injectable } from '@nestjs/common';
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
      data: {shorten: generateRandomURL(4), link: url},
      select: {shorten: true, link: true}
    })

    return shorten.shorten
  }
  
  async redirectToURL(url) {

    const findLink =  await this.prismaService.shorten.findUnique({
      where: {shorten: url}
    })

    if(!findLink){
      throw new HttpException(`URL TIDAK VALID`, 404)
    }

    return findLink
  }

  async generateCustomURL(url: string) {
    function generateRandomURL(length: number) {
      let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      let shorten = ''; 
      for (let index = 0; index < length; index++) { 
        shorten += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return shorten; 
    }
  
    const taken = await this.prismaService.shorten.findUnique({
      where: { shorten: url }, 
    });
  
    if (taken) {
      return this.generateURL(url); 
    }

    const shorten =  await this.prismaService.shorten.create({
      data: {shorten: generateRandomURL(4), link: url},
      select: {shorten: true, link: true}
    })

    return shorten.shorten
  }
  
  

}
