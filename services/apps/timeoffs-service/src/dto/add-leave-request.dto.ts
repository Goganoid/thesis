import {
  IsEnum,
  IsISO8601,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { LeaveType } from '../entities/leave-request.entity';

export class AddLeaveRequestDto {
  @IsEnum(LeaveType)
  type: LeaveType;

  @IsISO8601()
  start: string;

  @IsISO8601()
  end: Date;

  @IsOptional()
  @MaxLength(1000)
  comment: string;

  @IsUUID()
  teamId: string;
}
