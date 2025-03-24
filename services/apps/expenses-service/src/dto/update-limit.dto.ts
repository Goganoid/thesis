import { IsNumber, IsPositive, Max } from 'class-validator';
import { IsEnum } from 'class-validator';
import { InvoiceCategory } from '../enums/invoice.category';

export class UpdateLimitDto {
  @IsEnum(InvoiceCategory)
  category: InvoiceCategory;

  @IsNumber()
  @IsPositive()
  @Max(1000000)
  limit: number;
}
