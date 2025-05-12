import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req = context.switchToHttp().getRequest<Request>();

      const authHeader = req.cookies['Authorization'];

      if (!authHeader) {
        throw new UnauthorizedException('User Not Authorized');
      }

      const verified = await this.jwtService.verifyAsync(authHeader, { secret: process.env.SECRET_JWT });

      if (!verified) {
        throw new UnauthorizedException('User Not Authorized');
      }

      req['user'] = verified;

      return true;
    } catch (error) {
      console.error('UserGuard Error:', error.message);
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }
}
