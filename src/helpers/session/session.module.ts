import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@entities/user.entity";
import { Session } from "@entities/session.entity";
import { SessionHelper } from "./session.helper";

@Module({
    imports: [TypeOrmModule.forFeature([User, Session])],
    providers: [SessionHelper],
    exports: [SessionHelper] // allow other modules to use it
})
export class SessionHelperModule {}
