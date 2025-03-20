import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneratedUuidForInvoices1741848275652 implements MigrationInterface {
    name = 'GeneratedUuidForInvoices1741848275652'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice_entity" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice_entity" ALTER COLUMN "id" DROP DEFAULT`);
    }

}
