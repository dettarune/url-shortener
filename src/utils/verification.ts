import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from 'src/mailer/mailer.service';

export async function generateVerifCode(
    targetEmail: string,
    targetUsername: string,
    jwtService: JwtService,
    mailerService: MailerService
) {
    const token = jwtService.sign(
        { email: targetEmail },
        { secret: process.env.SECRET_JWT, expiresIn: '10m' }
    );

    const baseurl = process.env.BASE_URL
    const url = `${baseurl}/api/users/verification/${token}`;

    await mailerService.sendMail(
        targetEmail,
        targetUsername, 
        url
    );

    return token;
}
