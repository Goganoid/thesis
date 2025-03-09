import { Max, Min } from 'class-validator';

export class GetInvoiceDataDto {
  @Min(1970)
  @Max(2100)
  year: number;
}
