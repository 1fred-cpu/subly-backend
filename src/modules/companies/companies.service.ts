import {
    Injectable,
    Logger,
    NotFoundException,
    InternalServerErrorException
} from "@nestjs/common";
import { Company } from "@entities/company.entity";
import { User } from "@entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";

@Injectable()
export class CompaniesService {
    private logger = new Logger(CompaniesService.name);
    constructor(
        @InjectRepository(Company)
        private readonly companyRepo: Repository<Company>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly dataSource: DataSource
    ) {}

    //-------------------------------
    // Find a companny
    //-------------------------------
    async findCompany(companyId: string) {
        try {
            // Find a company with ID
            const company = await this.companyRepo.findOne({
                where: { id: companyId },
                relations: ["users", "subscriptions"],
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    users: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        profileImageUrl: true
                    },

                    subscriptions: true
                }
            });
            // Throw NotFoundException if company cannot be found
            if (!company) {
                throw new NotFoundException("Cannot find company");
            }
            // Return company
            return { company };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;

            this.logger.error(`Failed to find company: ${error.message}`);

            throw new InternalServerErrorException("Failed to find company");
        }
    }
}
