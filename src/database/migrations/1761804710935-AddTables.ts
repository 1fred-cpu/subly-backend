import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTables1761804710935 implements MigrationInterface {
    name = 'AddTables1761804710935'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "companyId" uuid NOT NULL, "category" text NOT NULL, "cost" integer NOT NULL, "billingCycle" text NOT NULL, "renewalDate" TIMESTAMP WITH TIME ZONE NOT NULL, "status" text NOT NULL, "notes" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "email" text NOT NULL, "phone" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1157fb02ef0db02a9bafd5d043" ON "companies" ("name", "email") `);
        await queryRunner.query(`CREATE TYPE "public"."users_authprovider_enum" AS ENUM('email')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "companyId" uuid NOT NULL, "name" text NOT NULL, "email" text NOT NULL, "passwordHash" text NOT NULL, "profileImageUrl" text, "emailVerified" boolean NOT NULL DEFAULT false, "authProvider" "public"."users_authprovider_enum" NOT NULL DEFAULT 'email', "emailVerificationToken" text, "emailVerificationExpiresAt" TIMESTAMP WITH TIME ZONE, "passwordResetToken" text, "passwordResetExpiresAt" TIMESTAMP WITH TIME ZONE, "role" text NOT NULL, "department" text, "isActive" boolean NOT NULL DEFAULT true, "isSuspended" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accessTokenHash" character varying, "accessTokenExpiresAt" TIMESTAMP WITH TIME ZONE, "refreshTokenHash" character varying, "refreshTokenExpiresAt" TIMESTAMP WITH TIME ZONE, "active" boolean NOT NULL DEFAULT true, "userAgent" character varying, "ipAddress" character varying, "isCurrent" boolean NOT NULL DEFAULT false, "isExpired" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b08788ca45cbd90f0bd96c2f07" ON "sessions" ("refreshTokenHash") `);
        await queryRunner.query(`CREATE INDEX "IDX_57de40bc620f456c7311aa3a1e" ON "sessions" ("userId") `);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_ea19a7bd47edc90d4f1f6f6f312" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_6f9395c9037632a31107c8a9e58" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_57de40bc620f456c7311aa3a1e6"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_6f9395c9037632a31107c8a9e58"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_ea19a7bd47edc90d4f1f6f6f312"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_57de40bc620f456c7311aa3a1e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b08788ca45cbd90f0bd96c2f07"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_authprovider_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1157fb02ef0db02a9bafd5d043"`);
        await queryRunner.query(`DROP TABLE "companies"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
    }

}
