import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DataSourceOptions } from "typeorm";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const databaseUrl = configService.get<string>("DATABASE_URL");

                return {
                    type: "postgres",
                           url: databaseUrl,
                    autoLoadEntities: true,
                    synchronize: false, // disable in production, use migrations instead
                    ssl: {
                        rejectUnauthorized: false // required for Neon’s SSL
                    },
                    extra: {
                        max: 10 // connection pool size
                    },
                    logging:
                        configService.get<string>("NODE_ENV") !== "production"
                            ? "all"
                            : ["error", "warn"]
                } as DataSourceOptions;
            }
        })
    ]
})
export class DatabaseModule {}
