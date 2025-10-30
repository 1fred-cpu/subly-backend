import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    companyName: string;

    @IsEmail()
    ownerEmail: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    @MinLength(2)
    ownerName: string;
}
