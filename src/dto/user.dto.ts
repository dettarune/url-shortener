import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
  @ApiProperty({ example: 'detarune16', description: 'The username of the new user' })
  @IsNotEmpty({ message: 'Username must not be empty' })
  username: string;

  @ApiProperty({ example: 'StrongPass123', description: 'The password must contain at least one uppercase letter' })
  @IsNotEmpty({ message: 'Password must not be empty' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  password: string;

  @ApiProperty({ example: 'detarune@example.com', description: 'A valid email address' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
}

export class LoginUserDTO {
  @ApiProperty({ example: 'detarune16', description: 'Your username' })
  @IsNotEmpty({ message: 'Username must not be empty' })
  username: string;

  @ApiProperty({ example: 'StrongPass123', description: 'Your password' })
  @IsNotEmpty({ message: 'Password must not be empty' })
  password: string;
}

export class PasswordDTO {
  @ApiProperty({ example: 'StrongPass123', description: 'A new password to be set' })
  @IsNotEmpty({ message: 'Password must not be empty' })
  password: string;
}

export class emailDTO {
  @ApiProperty({ example: 'detarune@example.com', description: 'The user\'s email address' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
}

export class verifyTokenDTO {
  @ApiProperty({ example: '9f8c3d7b-token', description: 'The verification token received via email' })
  @IsNotEmpty({ message: 'Token must not be empty' })
  @IsString({ message: 'Token must be a string' })
  token: string;
}
