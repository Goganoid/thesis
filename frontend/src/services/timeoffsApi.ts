import { timeoffsApiProvider } from "./api";
import { CreateTeamDto, UpdateTeamDto, MyTeamsDto, TeamLeaveRequestsDto, AddLeaveRequestDto, LeaveStatus, UserStatsDto, TimeoffSettingsDto } from "../types/timeoffs";

export const timeoffsApi = {
  getMyTeams: async (): Promise<MyTeamsDto> => {
    const response = await timeoffsApiProvider.get("/timeoffs/teams/my");
    return response.data;
  },
  updateTeam: async (teamId: string, dto: UpdateTeamDto): Promise<void> => {
    await timeoffsApiProvider.put(`/timeoffs/admin/teams/${teamId}`, dto);
  },
  createTeam: async (dto: CreateTeamDto): Promise<void> => {
    await timeoffsApiProvider.post("/timeoffs/admin/teams", dto);
  },
  getTeamLeaveRequests: async (teamId: string): Promise<TeamLeaveRequestsDto> => {
    const response = await timeoffsApiProvider.get(`/timeoffs/teams/${teamId}/leave-requests`);
    return response.data;
  },
  addLeaveRequest: async (teamId: string, dto: AddLeaveRequestDto): Promise<void> => {
    await timeoffsApiProvider.post(`/timeoffs/teams/${teamId}/leave-requests`, dto);
  },
  updateLeaveRequestStatus: async (id: string, status: LeaveStatus): Promise<void> => {
    await timeoffsApiProvider.put(`/timeoffs/admin/leave-requests/${id}`, { status });
  },
  getUserStats: async (teamId: string): Promise<UserStatsDto> => {
    const response = await timeoffsApiProvider.get(`/timeoffs/teams/${teamId}/my-stats`);
    return response.data;
  },
  getSettings: async (): Promise<TimeoffSettingsDto> => {
    const response = await timeoffsApiProvider.get("/timeoffs/settings");
    return response.data;
  },
  updateSettings: async (dto: Partial<TimeoffSettingsDto>): Promise<void> => {
    await timeoffsApiProvider.put("/timeoffs/admin/settings", dto);
  },
};
