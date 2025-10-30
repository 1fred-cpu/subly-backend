import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Session } from "@entities/session.entity";
import { User } from "@entities/user.entity";
import { Company } from "@entities/company.entity";
import { Subscription } from "@entities/subscription.entity";
import { JwtHelperModule } from "@helpers/jwt/jwt.module";
import { ApiKeyHelperModule } from "@helpers/api-key/api-key.module";
import { SessionHelperModule } from "@helpers/session/session.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Session, Company, Subscription]),
        JwtHelperModule,
        ApiKeyHelperModule,
        SessionHelperModule
    ],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule {}
