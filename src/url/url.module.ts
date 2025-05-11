import { Module } from '@nestjs/common';
import { AppController } from './url.controller';
import { AppService } from './url.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
