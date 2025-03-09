import { Min } from 'class-validator';

import { IsNumber } from 'class-validator';

export class UpdateSettingsDto {
  @IsNumber()
  @Min(1)
  maxVacationDays: number;

  @IsNumber()
  @Min(1)
  maxSickDays: number;
}