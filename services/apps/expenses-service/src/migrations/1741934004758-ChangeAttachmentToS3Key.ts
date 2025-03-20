import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeAttachmentToS3Key1741934004758 implements MigrationInterface {
    name = 'ChangeAttachmentToS3Key1741934004758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice_entity" RENAME COLUMN "attachment_url" TO "s3_key"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice_entity" RENAME COLUMN "s3_key" TO "attachment_url"`);
    }

}
