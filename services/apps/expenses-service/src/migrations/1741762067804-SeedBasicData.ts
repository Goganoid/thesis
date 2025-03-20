import { MigrationInterface, QueryRunner } from 'typeorm';
import { InvoiceCategory } from '../enums/invoice.category';

export class SeedBasicData1741762067804 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.insert('category_entity', [
      {
        id: InvoiceCategory.MEDICINE,
        limit: 200,
      },
      {
        id: InvoiceCategory.EDUCATION,
        limit: 350,
      },
      {
        id: InvoiceCategory.SPORT,
        limit: 200,
      },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete('category_entity', [
      { id: InvoiceCategory.MEDICINE },
      { id: InvoiceCategory.EDUCATION },
      { id: InvoiceCategory.SPORT },
    ]);
  }
}
