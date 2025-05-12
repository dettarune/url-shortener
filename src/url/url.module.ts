import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [UrlController],
  providers: [UrlService, PrismaService],
})
export class UrlModule {}
