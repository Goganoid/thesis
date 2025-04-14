export interface MemberDto {
  id: string;
  name: string;
}

export interface TeamDto {
  id: string;
  name: string;
  representativeId: string | null;
  members: MemberDto[];
}

export interface MyTeamsDto {
  teams: TeamDto[];
}

export interface CreateTeamDto {
  name: string;
  members: string[];
}

export interface UpdateTeamDto {
  name: string;
  members: string[];
}

export enum LeaveType {
  TimeOff = 'TimeOff',
  SickLeave = 'SickLeave',
}

export enum LeaveStatus {
  Approved = 'Approved',
  Declined = 'Declined',
  Waiting = 'Waiting',
}

export interface LeaveRequestDto {
  id: string;
  userId: string;
  name: string;
  type: LeaveType;
  status: LeaveStatus;
  reviewedByRepresentativeId: string;
  teamId: string;
  startDate: Date;
  endDate: Date;
}

export interface TeamLeaveRequestsDto {
  teamId: string;
  name: string;
  leaveRequests: LeaveRequestDto[];
}

export interface AddLeaveRequestDto {
  type: LeaveType;
  start: string;
  end: string;
  comment?: string;
}

export interface StatsDto {
  total: number;
  used: number;
}

export interface UserStatsDto {
  sickDays: StatsDto;
  timeoffDays: StatsDto;
}

export interface TimeoffSettingsDto {
  maxVacationDays: number;
  maxSickDays: number;
}
