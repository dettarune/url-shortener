import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
    private transporter: nodemailer.Transporter;
    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            ignoreTLS: false,
            secure: false,
            auth: {
                user: this.configService.get('MAIL_HOST'),
                pass: this.configService.get('MAIL_PW')
            },
        });
    }

    async sendMail(targetEmail: string, targetUsername: string, token, ): Promise<any>{
        try {
            this.transporter.sendMail({
                from: 'smallinURL',
                to: targetEmail,
                subject: "Verification Code – SmallinURL",
                html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 500px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #333;">Hello, ${targetUsername}, Please verify your account </h2>
                        <p style="font-size: 16px; color: #555;">We're excited to have you join <strong>SmallinURL</strong>! To get started, please verify your account using the token below. This link expires in <strong>10 minutes</strong>.</p>
                        
                        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #4CAF50; margin: 0;">${token}</h3>
                        </div>

                        <p style="font-size: 14px; color: #888;">If you didn’t request this email, please ignore it.</p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

                        <p style="font-size: 12px; color: #bbb; text-align: center;">
                            © ${new Date().getFullYear()} SmallinURL. All rights reserved.
                        </p>
                    </div
                    `
            })
        } catch (error) {
            console.log(error)
        }
    }

}