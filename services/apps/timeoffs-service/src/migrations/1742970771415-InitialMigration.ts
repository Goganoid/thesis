import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1742970771415 implements MigrationInterface {
    name = 'InitialMigration1742970771415'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "team_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "representative_id" character varying, "member_ids" jsonb NOT NULL DEFAULT '[]', "name" character varying NOT NULL, CONSTRAINT "PK_729030db84428f430d098ee9f4d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."leave_request_entity_type_enum" AS ENUM('TimeOff', 'SickLeave')`);
        await queryRunner.query(`CREATE TYPE "public"."leave_request_entity_status_enum" AS ENUM('Approved', 'Declined', 'Waiting')`);
        await queryRunner.query(`CREATE TABLE "leave_request_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "type" "public"."leave_request_entity_type_enum" NOT NULL, "status" "public"."leave_request_entity_status_enum" NOT NULL, "reviewed_by_representative_id" character varying, "team_id" uuid NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_990c5731405458016ad9cf40ed3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "settings" ("id" character varying NOT NULL DEFAULT 'primary', "max_vacation_days" integer NOT NULL, "max_sick_days" integer NOT NULL, CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "leave_request_entity" ADD CONSTRAINT "FK_a7b222b7c13b035779312933690" FOREIGN KEY ("team_id") REFERENCES "team_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`INSERT INTO "settings" ("id", "max_vacation_days", "max_sick_days") VALUES ('primary', 20, 10)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leave_request_entity" DROP CONSTRAINT "FK_a7b222b7c13b035779312933690"`);
        await queryRunner.query(`DROP TABLE "settings"`);
        await queryRunner.query(`DROP TABLE "leave_request_entity"`);
        await queryRunner.query(`DROP TYPE "public"."leave_request_entity_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."leave_request_entity_type_enum"`);
        await queryRunner.query(`DROP TABLE "team_entity"`);
    }

}
