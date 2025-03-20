import { QueryParamTransformArray } from '@app/shared/utils/dto/query-param-array';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, Max, Min } from 'class-validator';
import { InvoiceStatus } from '../enums/invoice.status';

export class GetInvoiceDataDto {
  @Min(1970)
  @Max(2100)
  @Type(() => Number)
  year: number;

  @IsArray()
  @IsOptional()
  @IsEnum(InvoiceStatus, { each: true })
  @QueryParamTransformArray()
  status?: InvoiceStatus[];
}
