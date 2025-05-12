import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO, emailDTO, LoginUserDTO, verifyTokenDTO } from 'src/dto/user.dto';
import { MailerService } from 'src/mailer/mailer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { randomInt } from 'crypto';
import { generateVerifCode } from 'src/utils/verification';
import { CustomErrorFilters } from 'src/error/custom-exception';
import { checkAuthConflict } from 'src/utils/auth.utils';

@Injectable()
export class UserService {
    constructor(
        private mailerService: MailerService,
        private prismaServ: PrismaService,
        private redisService: RedisService,
        private jwtService: JwtService
    ) { }

    async signUp(req: CreateUserDTO) {

        const user = await this.prismaServ.user.findFirst({
            where: {
                OR: [
                    { username: req.username },
                    { email: req.email }
                ]
            },
            select: {
                username: true,
                email: true
            }
        });

        if (user) {
            checkAuthConflict(user, req);
        }
        await this.prismaServ.user.create({
            data: {
                username: req.username,
                password: await bcrypt.hash(req.password, 10),
                email: req.email
            }
        });

        const token = await generateVerifCode(req.email, req.username, this.jwtService, this.mailerService)

        await this.redisService.setTTL(`verification_code:${req.email}`, token, 10 * 60);
        return {
            email: req.email,
            username: req.username
        };
    }


    async login(req: LoginUserDTO) {
        try {
            const user = await this.prismaServ.user.findFirst({
                where: { username: req.username },
                select: { username: true, password: true, email: true, id: true }
            });

            if (!user)
                throw new HttpException('Username or password is incorrect', HttpStatus.NOT_FOUND);

            const isPasswordCorrect = await bcrypt.compare(req.password, user.password);
            if (!isPasswordCorrect)
                throw new HttpException('Username or password is incorrect', HttpStatus.NOT_FOUND);

            const token = generateVerifCode(user.email, req.username, this.jwtService, this.mailerService)

            await this.redisService.setTTL(`verif-code-${user.email}`, token, 5 * 60);

            return {
                message: `Success send verif token to: ${user.email}`,
                email: user.email
            };
        } catch (error) {
            console.error(error.message);
            throw new HttpException(error.message, error.status);
        }
    }

    async verify(tokenDto: verifyTokenDTO) {
        try {
            let payload;
            try {
                payload = this.jwtService.verify(tokenDto.token, {
                    secret: process.env.SECRET_JWT
                });
            } catch (err) {
                throw new HttpException('Invalid or Expired Token', HttpStatus.UNAUTHORIZED);
            }

            const redisKey = `verification_code:${payload.email}`;
            const tokenRedis = await this.redisService.get(redisKey);

            if (!tokenRedis) {
                throw new HttpException('Verification Code Expired or Invalid', HttpStatus.GONE);
            }

            if (tokenRedis !== tokenDto.token) {
                throw new HttpException('Verification Token Not Matched', HttpStatus.FORBIDDEN);
            }

            const user = await this.prismaServ.user.findFirst({
                where: { email: payload.email }
            });

            if (!user) {
                throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
            }

            const jwtToken = this.jwtService.sign(
                { id: user.id, username: user.username, email: user.email },
                { secret: process.env.SECRET_JWT, expiresIn: '7d' }
            );

            await this.redisService.delToken(redisKey);

            return { jwtToken };

        } catch (error) {
            console.error(error.message);
            throw new HttpException(error.message, error.code);
        }
    }



    async recovery(req: emailDTO) {
        try {
            const findEmail = await this.prismaServ.user.findFirst({
                where: { email: req.email },
                select: { email: true }
            });

            if (!findEmail) {
                throw new HttpException('Email not found in our database', HttpStatus.NOT_FOUND);
            }

            const token = randomInt(100000, 999999).toString();
            await this.mailerService.sendMail(req.email, `${req.email}, KODE RECOVERY SEKALI PAKAI`, token);

            await this.redisService.setTTL(`recovery-code-${req.email}`, token, 5 * 60);

            return {
                message: `Success send recovery token to: ${req.email}`
            };
        } catch (error) {
            console.error(error.message);
            throw new HttpException(error.message, error.status);
        }
    }

    async updatePassword(username: string, reqPassword: string): Promise<any> {
        try {
            const hashedPassword = await bcrypt.hash(reqPassword, 10);

            const user = await this.prismaServ.user.findUnique({
                where: { username },
                select: { password: true }
            });

            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            const isSame = await bcrypt.compare(reqPassword, user.password);
            if (isSame) {
                throw new HttpException('Password telah dipakai sebelumnya, mohon ganti yang lain', HttpStatus.BAD_REQUEST);
            }

            await this.prismaServ.user.update({
                where: { username },
                data: { password: hashedPassword }
            });

            return { message: 'Password updated successfully' };
        } catch (error) {
            console.log(error.message);
            throw new HttpException(error.message, error.status);
        }
    }

    async getInfoMe(username: string) {
        try {
            const user = await this.prismaServ.user.findUnique({
                where: { username }
            });

            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            return { user };
        } catch (error) {
            console.error(error.message);
            throw new HttpException(error.message, error.status);
        }
    }

    async logOut(username: string): Promise<any> {
        try {
            const user = await this.prismaServ.user.findUnique({
                where: { username },
                select: { username: true }
            });

            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            return { message: 'User logout (or token cleanup, if applicable)' };
        } catch (error) {
            console.error(error.message);
            throw new HttpException(error.message, error.status);
        }
    }
}
