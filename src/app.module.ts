import { Global, Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { PrismaService } from './prisma/prisma.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ConfigModule } from '@nestjs/config';
import { MailerService } from './mailer/mailer.service';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UrlService } from './url/url.service';
import { UrlController } from './url/url.controller';
import { UrlModule } from './url/url.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './error/error.filters';


@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_JWT,
      signOptions: { expiresIn: "10d" }
    }),
    UserModule,
    WinstonModule.forRoot({
      level: 'debug',
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    RedisModule,
    UrlModule,
  ],
  controllers: [UrlController],
  providers: [JwtService, UserService, PrismaService, MailerService, RedisService, UrlService,],
})
export class AppModule { }