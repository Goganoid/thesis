import { Column, Entity, OneToMany } from 'typeorm';
import { InvoiceEntity } from './invoice.entity';
import { ColumnNumericTransformer } from '../infra/typeorm/numeric.transformer';
import { InvoiceCategory } from '../enums/invoice.category';

@Entity()
export class CategoryEntity {
  @Column({ type: 'varchar', nullable: false })
  category: InvoiceCategory;

  @OneToMany(() => InvoiceEntity, (invoice) => invoice.categoryRef, {
    cascade: true,
  })
  invoices: InvoiceEntity[];

  @Column({
    type: 'numeric',
    transformer: new ColumnNumericTransformer(),
    nullable: false,
  })
  limit: number;
}
