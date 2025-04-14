import { IsEnum } from 'class-validator';
import { LeaveStatus } from '../entities/leave-request.entity';

export class UpdateLeaveRequestDto {
  @IsEnum(LeaveStatus)
  status: LeaveStatus;
}
