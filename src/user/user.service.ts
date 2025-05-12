import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDTO, emailDTO, LoginUserDTO, verifyTokenDTO } from 'src/dto/user.dto';
import { MailerService } from 'src/mailer/mailer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { randomInt } from 'crypto';

@Injectable()
export class UserService {
    constructor(
        private mailerService: MailerService,
        private prismaServ: PrismaService,
        private redisService: RedisService,
        private jwtService: JwtService
    ) {}

    async signUp(req: CreateUserDTO) {
        try {
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
                const usernameTaken = user.username === req.username;
                const emailTaken = user.email === req.email;

                if (usernameTaken && emailTaken) {
                    throw new HttpException('Username dan Email sudah terdaftar', HttpStatus.CONFLICT);
                } else if (usernameTaken) {
                    throw new HttpException('Username sudah terdaftar', HttpStatus.CONFLICT);
                } else if (emailTaken) {
                    throw new HttpException('Email sudah terdaftar', HttpStatus.CONFLICT);
                }
            }

            const token = this.jwtService.sign(
                { email: user.email},
                { secret: process.env.SECRET_JWT, expiresIn: '10m' }
            );

            await this.prismaServ.user.create({
                data: {
                    username: req.username,
                    password: await bcrypt.hash(req.password, 10),
                    email: req.email
                }
            });

            await this.mailerService.sendMail(user.email, `${user.email}, KODE RECOVERY SEKALI PAKAI`, token);

            await this.redisService.setTTL(`verification_code:${user.email}`, token, 10 * 60);

            return {
                email: user.email,
                username: user.username
            };
            
        } catch (error) {
            console.error(error.message);
            throw new HttpException(error.message, error.status || 500);
        }
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

            const verifCode = randomInt(100000, 999999).toString();

            await this.mailerService.sendMail(user.email, `${user.username}, KODE RECOVERY SEKALI PAKAI`, verifCode);

            await this.redisService.setTTL(`verif-code-${user.email}`, verifCode, 5 * 60);
            await this.redisService.setTTL(`username-${user.email}`, user.username, 5 * 60);
            await this.redisService.setTTL(`id-${user.email}`, user.id.toString(), 5 * 60);

            return {
                message: `Success send verif token to: ${user.email}`,
                email: user.email
            };
        } catch (error) {
            console.error(error.message);
            throw new HttpException(error.message, error.status || 500);
        }
    }

    async verify(email: emailDTO, token: verifyTokenDTO) {
        try {
            const verifCode = await this.redisService.get(`verif-code-${email.email}`);
            const username = await this.redisService.get(`username-${email.email}`);
            const id = await this.redisService.get(`id-${email.email}`);

            if (!verifCode) {
                throw new HttpException('Token expired, please request a new one', HttpStatus.GONE);
            }

            if (!token || token.token !== verifCode) {
                throw new HttpException('Token invalid', HttpStatus.UNAUTHORIZED);
            }

            const jwtToken = this.jwtService.sign(
                { id, username, email: email.email },
                { secret: process.env.SECRET_JWT, expiresIn: '7d' }
            );

            await this.redisService.delToken(`verif-code-${email.email}`);
            await this.redisService.delToken(`username-${email.email}`);
            await this.redisService.delToken(`id-${email.email}`);

            return { jwtToken };
        } catch (error) {
            console.error(error.message);
            throw new HttpException(error.message, error.status || 500);
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
            throw new HttpException(error.message, error.status || 500);
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
            throw new HttpException(error.message, error.status || 500);
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
            throw new HttpException(error.message, error.status || 500);
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
            throw new HttpException(error.message, error.status || 500);
        }
    }
}
