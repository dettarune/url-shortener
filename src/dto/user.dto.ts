import { Contains, IsEmail, IsNotEmpty, IsNumber, IsString, Matches, Min } from "class-validator"
import { verify } from "crypto"

export class CreateUserDTO {
    @IsNotEmpty()
    username: string

    @IsNotEmpty()
    @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    password: string

    @IsNotEmpty()
    @IsEmail()
    email: string
}



export class LoginUserDTO {
    @IsNotEmpty()
    username: string

    @IsNotEmpty()
    password: string
    
}

export class PasswordDTO {
    @IsNotEmpty()
    password: string
}

export class emailDTO {
    @IsEmail()
    email: string
}

export class verifyTokenDTO {
    @IsNotEmpty({ message: "Token cannot be empty" })
    @IsString()
    token: string
}