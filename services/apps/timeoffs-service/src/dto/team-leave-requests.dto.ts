import { LeaveRequestDto } from './leave-request.dto';

export class TeamLeaveRequestsDto {
  teamId: string;
  name: string;
  leaveRequests: LeaveRequestDto[];
}
