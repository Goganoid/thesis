import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { InvoiceEntity } from './invoice.entity';
import { InvoiceCategory } from '../enums/invoice.category';
import { ColumnNumericTransformer } from '@app/shared/typeorm/numeric.transformer';

@Entity()
export class CategoryEntity {
  @PrimaryColumn({ type: 'varchar', nullable: false })
  id: InvoiceCategory;

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
