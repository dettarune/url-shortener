import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateCharacter } from 'src/utils/generateChar';

@Injectable()
export class AppService {
  constructor(private prismaService: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async generateURL(url: string) {
    const isShortenedTaken = async (shortened: string) => {
      const taken = await this.prismaService.shorten.count({
        where: { shorten: shortened },
      });
      return taken > 0;
    };

    let endpoint = generateCharacter(4);
    while (await isShortenedTaken(endpoint)) {
      endpoint = generateCharacter(4);
    }

    // Simpan data ke database
    const result = await this.prismaService.shorten.create({
      data: { shorten: endpoint, link: url },
      select: { shorten: true, link: true },
    });

    console.log(`Shortened URL: ${endpoint}`);
    return endpoint;
  }

  async redirectToURL(url: string) {
    const findLink = await this.prismaService.shorten.findUnique({
      where: { shorten: url },
    });

    if (!findLink) {
      throw new HttpException('URL TIDAK VALID', 404);
    }

    return findLink;
  }

  async generateCustomURL(customURL: string, url: string) {
    const isURLTaken = async (endpoint: string) => {
      const isTaken = await this.prismaService.shorten.count({
        where: { shorten: endpoint },
      });

      if (isTaken > 0) {
        throw new HttpException('URL sudah digunakan, harap pilih yang lain!', 400);
      }
    };

    // Cek jika custom URL sudah ada
    await isURLTaken(customURL);

    // Simpan data ke database
    const result = await this.prismaService.shorten.create({
      data: { shorten: customURL, link: url },
      select: { shorten: true, link: true },
    });

    console.log(`Custom URL: ${customURL}`);
    return customURL;
  }
}
