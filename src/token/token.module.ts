import { Module } from '@nestjs/common';
import { AppController } from './token.controller';
import { AppService } from './token.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
