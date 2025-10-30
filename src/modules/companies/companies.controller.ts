import { Controller, Post, Get, Param, ParseUUIDPipe } from "@nestjs/common";
import { CompaniesService } from "./companies.service";

@Controller("companies")
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) {}

    //-------------------------------
    // Find a company
    //-------------------------------
    @Get(":companyId")
   async findCompany(@Param("companyId", ParseUUIDPipe) companyId: string) {
      return await this.companiesService.findCompany(companyId)
    }
}
//67163000-4bdf-4723-965c-46fb7f119bbb
