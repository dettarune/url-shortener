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
            @Res({ passthrough: true }) res: Response
        ) {
            
            try {
                res.setHeader('email', req.email)
                res.status(201)
                const result = await this.userService.signUp(req)
                return {
                    message: `Sukses membuat akun dengan username ${result.username}`
                }
            } catch (error) {
                console.error(error.message)
        }
    }
    
    
        @Post('/login')
        async login(
            @Body() req: LoginUserDTO,
            @Res({ passthrough: true }) res: Response
        ) {
            try {
                const result = await this.userService.login(req)
                res.setHeader('email', result.email)
                return {
                    message: `Succes Send Verif Token To: ${result.email}, Please Check Your Email`
                }
            } catch (error) {
                console.error(error.messagee)
            }
        }

    
    @Post('/verify')
    async verify(
        @Headers('email') email: emailDTO,
        @Body() req: verifyTokenDTO,
        @Res({ passthrough: true }) res: Response

    ) {

        try {
            const result = await this.userService.verify(email, req)

            res.cookie('Authorization', result.jwtToken, { httpOnly: true, secure: true, maxAge: 604800000 })
            return {
                message: "Login Success!"
            }

        } catch (error) {
            console.log(error)
        }
    }


    @Post('/recovery')
    async recovery(
        @Body() req: emailDTO
    ) {

        try {
            const result = this.userService.recovery(req)
            return {
                message: `Succes Send Recovery Token To: ${req.email}`
            }
        } catch (error) {
            console.log(error)
        }
    }


    @Post('/recovery/password')
    async updatePassword(
        @Req() { user }: Request,
        @Body() req: PasswordDTO,
    ) {

        try {
            const {username} = user
            const result = this.userService.updatePassword(username, req.password)
            return {
               message: "Password Telah Berhasil Diupdate!"
            }
        } catch (error) {
            console.log(error)
        }
    }


    @Get('')
    @UseGuards(UserGuard) 
    async getInfoMe(
        @Req() { user }: Request, 
    ): Promise<any> {
        try {
    
        const {username} = user

            const result = await this.userService.getInfoMe(username)

            return {
                message: `Succes Get ${username}'s Info!`,
                data: {
                    ...result.user,
                }
            }

        } catch (error) {
            console.log(error)
        }
    }


    @Delete('')
    @UseGuards(UserGuard)
    async logOut(
        @Res({ passthrough: true }) res: Response
    ): Promise<any> {
        try {
            res.clearCookie('Authorization', { httpOnly: true, secure: true, path: '/', });

            return res.status(HttpStatus.OK).json({
                message: 'User successfully logged out',
              });

        } catch (error) {
            console.log(error.message)
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Internal Server Error',
              });
        }
    }


    @Get('/:id')
    async getUserById(@Param('id') id: string) {

        try {
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
        } catch (error) {
            console.error(error.message)
        }
    }

}