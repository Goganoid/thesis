import {
  InvoiceCategory,
  InvoiceStatus,
} from '../domain/expenses/expenses.domain.entity';

export class CreateInvoiceDto {
  amount: number;
  status: InvoiceStatus;
  description: string;
  attachmentUrl: string | null;
  category: InvoiceCategory;
}
