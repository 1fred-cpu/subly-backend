import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RealtimeModule } from "./modules/realtime/realtime.module";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "@modules/auth/auth.module";
import { CompaniesModule } from "@modules/companies/companies.module";
import { EmailModule } from "@channels/email/email.module";
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ".env"
        }),
        DatabaseModule,
        EmailModule,
        AuthModule,
        CompaniesModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
