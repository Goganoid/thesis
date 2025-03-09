import { IsEnum } from 'class-validator';
import { InvoiceStatus } from '../enums/invoice.status';

export class UpdateInvoiceDto {
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
}
