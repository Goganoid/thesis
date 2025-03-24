import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrdering1742799210930 implements MigrationInterface {
    name = 'AddOrdering1742799210930'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category_entity" ADD "order" SERIAL NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category_entity" DROP COLUMN "order"`);
    }

}
