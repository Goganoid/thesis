import { InvoiceCategory } from '../enums/invoice.category';
import { InvoiceStatus } from '../enums/invoice.status';

export class CreateInvoiceDto {
  amount: number;
  status: InvoiceStatus;
  description: string;
  attachmentUrl: string | null;
  category: InvoiceCategory;
}
