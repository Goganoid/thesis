import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { ColumnNumericTransformer } from '../infra/typeorm/numeric.transformer';
import { InvoiceCategory } from '../enums/invoice.category';
import { InvoiceStatus } from '../enums/invoice.status';
import { CategoryEntity } from './category.entity';

@Entity()
export class InvoiceEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar', nullable: false })
  userId: string;

  @ManyToOne(() => CategoryEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'category', referencedColumnName: 'category' })
  categoryRef: CategoryEntity;

  @Column({ name: 'category', nullable: false })
  category: InvoiceCategory;

  @Column({ type: 'numeric', transformer: new ColumnNumericTransformer() })
  amount: number;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    enumName: 'invoice_status_enum',
  })
  status: InvoiceStatus;

  @Column({ type: 'varchar', nullable: true, default: '' })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  attachmentUrl: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
