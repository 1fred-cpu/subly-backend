import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@entities/user.entity";
import { ApiKeyHelper } from "./api-key.helper";

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [ApiKeyHelper],
    exports: [ApiKeyHelper] // allow other modules to use it
})
export class ApiKeyHelperModule {}
