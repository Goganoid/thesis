import { IsString } from 'class-validator';

export class DeleteInvoiceDto {
  @IsString()
  invoiceId: string;
}
