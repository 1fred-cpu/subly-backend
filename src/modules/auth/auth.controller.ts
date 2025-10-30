import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Ip,
    Post,
    ValidationPipe,
    Headers
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { SignInDto } from "./dto/signin.dto";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    //-------------------------------
    // Register a company
    //-------------------------------
    @Post("register")
    async register(@Body(ValidationPipe) dto: RegisterDto) {
        return await this.authService.register(dto);
    }
    //-------------------------------
    // Sign in user
    //-------------------------------
    @Post("signin")
    @HttpCode(HttpStatus.OK)
    async signIn(
        @Body(ValidationPipe) dto: SignInDto,
        @Ip() ipAddress?: string,
        @Headers("user-agent") userAgent?: string
    ) {
        return await this.authService.signIn(dto, ipAddress, userAgent);
    }
    //-------------------------------
    // Verify email
    //-------------------------------
    @Post("verify-email")
    @HttpCode(HttpStatus.OK)
    async verifyEmail(
        @Body("token") token: string,
        @Ip() ipAddress?: string,
        @Headers("user-agent") userAgent?: string
    ) {
        return await this.authService.verifyEmail(token, ipAddress, userAgent);
    }

    //-------------------------------
    // Sign in with google
    //-------------------------------
    @Post("signin-with-google")
    @HttpCode(HttpStatus.OK)
    async signInWithGoogle(
        @Body("idToken") idToken: string,
        @Ip() ipAddress?: string,
        @Headers("user-agent") userAgent?: string
    ) {
        return await this.authService.signInWithGoogle(
            idToken,
            ipAddress,
            userAgent
        );
    }

    //-------------------------------
    // Refresh access token
    //-------------------------------
    @Post("refresh-access-token")
    @HttpCode(HttpStatus.OK)
    async refreshAccessToken(
        @Body() dto: { userId: string; refreshToken: string },
        @Ip() ipAddress?: string,
        @Headers("user-agent") userAgent?: string
    ) {
        const { userId, refreshToken } = dto;
        return await this.authService.refreshAccessToken({
            userId,
            refreshToken,
            userAgent,
            ipAddress
        });
    }

    //-------------------------------
    // Request a reset password
    //-------------------------------
    @Post("request-reset-password")
    @HttpCode(HttpStatus.OK)
    async requestPasswordReset(@Body("email") email: string) {
        return await this.authService.requestPasswordReset(email);
    }
    //-------------------------------
    // Reset password
    //-------------------------------
    @Post("reset-password")
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() dto: { token: string; newPassword: string }) {
        const { token, newPassword } = dto;
        return await this.authService.resetPassword(token, newPassword);
    }
    //-------------------------------
    // Logout user
    //-------------------------------
    @Post("logout")
    @HttpCode(HttpStatus.OK)
    async logout(@Body("sessionId") sessionId: string) {
        return await this.authService.logout(sessionId);
    }
}
