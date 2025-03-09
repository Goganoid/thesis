import { InvoiceCategory } from '../enums/invoice.category';
import { InvoiceDto } from './invoice.dto';

export class CategoryDto {
  category: InvoiceCategory;
  limit: number;
  used: number;
}

export class UserInvoiceDataDto {
  invoices: InvoiceDto[];
  categories: CategoryDto[];
}
