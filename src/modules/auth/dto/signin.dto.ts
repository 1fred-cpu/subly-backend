import { IsEmail, MinLength, IsString } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  @IsString()
  password: string;
}
