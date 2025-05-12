import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import {  UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from 'src/mailer/mailer.service';
import { RedisService } from 'src/redis/redis.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule,
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_JWT,
      signOptions: { expiresIn: "7d" }
    })
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService, MailerService, RedisService, JwtService]
})
export class UserModule { }