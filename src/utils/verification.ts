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

    const url = `http://localhost:3000/api/users/verification-code/welcome/${token}`;

    await mailerService.sendMail(
        targetEmail,
        `${targetUsername}, Expire in 10 Minutes`,
        url
    );

    return token;
}
