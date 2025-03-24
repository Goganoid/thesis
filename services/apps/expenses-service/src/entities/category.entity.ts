import { Column, Entity, OneToMany, PrimaryColumn, Generated } from 'typeorm';
import { InvoiceEntity } from './invoice.entity';
import { InvoiceCategory } from '../enums/invoice.category';
import { ColumnNumericTransformer } from '@app/shared/typeorm/numeric.transformer';

@Entity()
export class CategoryEntity {
  @PrimaryColumn({ type: 'varchar', nullable: false })
  id: InvoiceCategory;

  @Column({ type: 'integer', nullable: false })
  @Generated('increment')
  order: number;

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
