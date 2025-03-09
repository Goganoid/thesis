import { InvoiceCategory } from '../enums/invoice.category';
import { InvoiceStatus } from '../enums/invoice.status';

export class InvoiceDto {
  id: string;

  userId: string;

  category: InvoiceCategory;

  amount: number;

  status: InvoiceStatus;

  description: string;

  attachmentUrl: string | null;

  createdAt: Date;
}
