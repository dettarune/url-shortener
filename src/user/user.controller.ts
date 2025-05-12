import { Body, Controller, Delete, Get, Headers, HttpCode, HttpException, HttpStatus, Param, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { CreateUserDTO, emailDTO, LoginUserDTO, PasswordDTO, verifyTokenDTO } from 'src/dto/user.dto';
import { RedisService } from 'src/redis/redis.service';
import { Request, Response } from 'express';
import { PassThrough } from 'stream';
import { MailerService } from 'src/mailer/mailer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpExceptionFilter } from 'src/error/error.filters';
import { UserGuard } from 'src/auth/auth.guard';
import { UserService } from './user.service';

@Controller('/api/users/')
@UseFilters(HttpExceptionFilter)
export class UserController {
    constructor(
        private userService: UserService,
        private redisServ: RedisService,
        private MailerService: MailerService,
        private prismaServ: PrismaService
    ) { }


    @Post('')
    async signUp(
        @Body() req: CreateUserDTO,
    ) {

        const result = await this.userService.signUp(req)
        return {
            message: `Sukses membuat akun dengan username ${result.username}`
        }

    }


    @Post('/login')
    async login(
        @Body() req: LoginUserDTO,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.userService.login(req)
        res.setHeader('email', result.email)
        return {
            message: `Succes Send Verif Token To: ${result.email}, Please Check Your Email`
        }
    }


    @Get('/verification-code/welcome/:verifCode')
    async verify(
        @Param('verifCode') verifCode: string,
        @Res({ passthrough: true }) res: Response
    ) {
        const result = await this.userService.verify({ token: verifCode });

        res.cookie('Authorization', result.jwtToken, {
            httpOnly: true,
            secure: false, // false=http
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return {
            message: "Login Success!"
        };

    }


    @Post('/recovery')
    async recovery(
        @Body() req: emailDTO
    ) {

        const result = this.userService.recovery(req)
        return {
            message: `Succes Send Recovery Token To: ${req.email}`
        }

    }


    @Post('/recovery/password')
    async updatePassword( @Req() { user }: Request, @Body() req: PasswordDTO,) {

        const { username } = user
        const result = this.userService.updatePassword(username, req.password)
        return {
            message: "Password Telah Berhasil Diupdate!"
        }

    }


    @Get('')
    @UseGuards(UserGuard)
    async getInfoMe( @Req() { user }: Request,): Promise<any> {

        const { username } = user

        const result = await this.userService.getInfoMe(username)

        return {
            message: `Succes Get ${username}'s Info!`,
            data: {
                ...result.user,
            }
        }

    }


    @Delete('')
    @UseGuards(UserGuard)
    async logOut(@Res({ passthrough: true }) res: Response): Promise<any> {
        res.clearCookie('Authorization', { httpOnly: true, secure: true, path: '/', });

        return res.status(HttpStatus.OK).json({
            message: 'User successfully logged out',
        });

    }


    @Get('/:id')
    async getUserById(@Param('id') id: string) {

        const user = await this.prismaServ.user.findUnique({
            where: { id: parseInt(id, 10) }
        })

        if (!user) {
            throw new HttpException('User not found', 404);
        }

        return {
            data: {
                user
            }
        }
    }

}