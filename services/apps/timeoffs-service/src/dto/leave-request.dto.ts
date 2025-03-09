import { LeaveStatus, LeaveType } from '../entities/leave-request.entity';

export class LeaveRequestDto {
  id: string;

  userId: string;

  type: LeaveType;

  status: LeaveStatus;

  reviewedByRepresentativeId: string;

  teamId: string;

  startDate: Date;

  endDate: Date;
}
