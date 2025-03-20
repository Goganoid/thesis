import { ColumnNumericTransformer } from '@app/shared/typeorm/numeric.transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { InvoiceCategory } from '../enums/invoice.category';
import { InvoiceStatus } from '../enums/invoice.status';
import { CategoryEntity } from './category.entity';

@Entity()
export class InvoiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  userId: string;

  @ManyToOne(() => CategoryEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'category', referencedColumnName: 'id' })
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
  s3Key: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
