import { Module } from "@nestjs/common";
import { CompaniesService } from "./companies.service";
import { CompaniesController } from "./companies.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Company } from "@entities/company.entity";
import { User } from "@entities/user.entity";
import { Subscription } from "@entities/subscription.entity";
@Module({
    imports: [TypeOrmModule.forFeature([User, Company, Subscription])],
    controllers: [CompaniesController],
    providers: [CompaniesService]
})
export class CompaniesModule {}
