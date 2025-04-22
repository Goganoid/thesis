import { IsISO8601 } from 'class-validator';

export class GenerateReportDto {
  @IsISO8601()
  start: string;

  @IsISO8601()
  end: string;
}
