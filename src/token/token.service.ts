import { HttpException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { randomize } from 'randomatic'
import { generateCharacter } from 'src/utils/generateChar';

@Injectable()
export class AppService {
  constructor(private prismaService: PrismaService) {

  }
  getHello(): string {
    return 'Hello World!';
  }

  async generateURL(url: string) {

    const isShortenedTaken = async (shortened: string) => {
      const taken = await this.prismaService.shorten.count({
        where: { shorten: shortened }
      });
      return taken > 0;
    };
  
    let endpoint = generateCharacter(4);
    while (await isShortenedTaken(endpoint)) {
      endpoint = generateCharacter(4);
    }
  
    // buat insert data (link nya...) ke table
    const result = await this.prismaService.shorten.create({
      data: { shorten: endpoint, link: url },
      select: { shorten: true, link: true }
    });
    
    console.log(endpoint);
    return endpoint;
  }
  
  
  
  async redirectToURL(url) {

    const findLink =  await this.prismaService.shorten.findUnique({
      where: {shorten: url},
      })

    if(!findLink){
      throw new HttpException(`URL TIDAK VALID`, 404)
    }

    return findLink
  }
  

  async generateCustomURL(customURL: string, url: string) {

    const isURLTaken = async (endpoint: string) => {
      const isTaken = await this.prismaService.shorten.count({
        where: { shorten: endpoint }
      });
    
      if (isTaken > 0) {
        throw new Error('URL sudah digunakan, harap pilih yang lain!');
      }
    };
    
    let endpoint = customURL;
    await isURLTaken(customURL);

    // buat insert data (link nya...) ke table
    const result = await this.prismaService.shorten.create({
      data: { shorten: customURL, link: url },
      select: { shorten: true, link: true }
    });
    
    console.log(endpoint);
    return endpoint;
  }
  
  

}
