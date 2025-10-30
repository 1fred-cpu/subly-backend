import { IsString ,IsNotEmpty} from "class-validator";

export class SignInWithGoogle{
  @IsString()
  @IsNotEmpty()
  idToken:string
}