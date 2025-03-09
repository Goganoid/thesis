import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1741242983542 implements MigrationInterface {
    name = 'Initial1741242983542'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."invoice_status_enum" AS ENUM('PAID', 'IN_PROGRESS', 'REJECTED', 'WAITING_APPROVAL')`);
        await queryRunner.query(`CREATE TABLE "invoice_entity" ("id" uuid NOT NULL, "user_id" character varying NOT NULL, "category" character varying NOT NULL, "amount" numeric NOT NULL, "status" "public"."invoice_status_enum" NOT NULL, "description" character varying DEFAULT '', "attachment_url" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_276fe1a123e3f68d3f7951cf075" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "category_entity" ("id" character varying NOT NULL, "limit" numeric NOT NULL, CONSTRAINT "PK_1a38b9007ed8afab85026703a53" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "invoice_entity" ADD CONSTRAINT "FK_efb051449d05b4bb4ba82d58306" FOREIGN KEY ("category") REFERENCES "category_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice_entity" DROP CONSTRAINT "FK_efb051449d05b4bb4ba82d58306"`);
        await queryRunner.query(`DROP TABLE "category_entity"`);
        await queryRunner.query(`DROP TABLE "invoice_entity"`);
        await queryRunner.query(`DROP TYPE "public"."invoice_status_enum"`);
    }

}
