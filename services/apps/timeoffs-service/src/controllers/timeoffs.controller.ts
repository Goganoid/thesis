import { UserData } from '@app/auth';
import { User } from '@app/auth/user.decorator';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CommandBus, CommandResult, QueryBus, QueryResult } from '@nestjs/cqrs';
import { AddLeaveRequestCommand } from '../commands/user/add-leave-request.command';
import { AddLeaveRequestDto } from '../dto/add-leave-request.dto';
import { GetMyTeamsQuery } from '../queries/get-my-teams.query';
import { GetSettingsQuery } from '../queries/get-settings-query';
import { GetTeamLeaveRequestsQuery } from '../queries/get-team-leave-requests.query';
import { GetTeamQuery } from '../queries/get-team.query';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { UpdateTeamCommand } from '../commands/admin/update-team.command';
import { CreateTeamDto } from '../dto/create-team.dto';
import { CreateTeamCommand } from '../commands/admin/create-team.command';
import { UpdateSettingsCommand } from '../commands/admin/update-setttings.command';
import { UpdateSettingsDto } from '../dto/update-setttings.dto';
import { UpdateLeaveRequestDto } from '../dto/update-leave-request.dto';
import { UpdateLeaveRequestCommand } from '../commands/admin/update-leave-request.command';
import { GetUserStatsQuery } from '../queries/get-user-stats.query';
@Controller('timeoffs')
export class TimeoffsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('teams/my')
  async getMyTeams(
    @User() user: UserData,
  ): Promise<QueryResult<GetMyTeamsQuery>> {
    return await this.queryBus.execute(new GetMyTeamsQuery(user.id));
  }

  @Get('teams/:teamId/my-stats')
  async getUserStats(
    @User() user: UserData,
    @Param('teamId') teamId: string,
  ): Promise<QueryResult<GetUserStatsQuery>> {
    return await this.queryBus.execute(new GetUserStatsQuery(user.id, teamId));
  }

  @Get('settings')
  async getSettings(): Promise<QueryResult<GetSettingsQuery>> {
    return await this.queryBus.execute(new GetSettingsQuery());
  }

  @Get('teams/:teamId/leave-requests')
  async getTeamLeaveRequests(
    @User() user: UserData,
    @Param('teamId') teamId: string,
  ): Promise<QueryResult<GetTeamLeaveRequestsQuery>> {
    return await this.queryBus.execute(
      new GetTeamLeaveRequestsQuery({ teamId, userId: user.id }),
    );
  }

  @Get('teams/:teamId')
  async getTeam(
    @User() user: UserData,
    @Param('teamId') teamId: string,
  ): Promise<QueryResult<GetTeamQuery>> {
    return await this.queryBus.execute(
      new GetTeamQuery({ teamId, userId: user.id }),
    );
  }

  @Post('teams/:teamId/leave-requests')
  async addLeaveRequest(
    @User() user: UserData,
    @Param('teamId') teamId: string,
    @Body() dto: AddLeaveRequestDto,
  ): Promise<CommandResult<AddLeaveRequestCommand>> {
    return await this.commandBus.execute(
      new AddLeaveRequestCommand(user, teamId, dto),
    );
  }

  @Put('admin/teams/:teamId')
  async updateTeam(
    @User() user: UserData,
    @Param('teamId') teamId: string,
    @Body() dto: UpdateTeamDto,
  ): Promise<CommandResult<UpdateTeamCommand>> {
    return await this.commandBus.execute(
      new UpdateTeamCommand(user, teamId, dto),
    );
  }

  @Post('admin/teams')
  async createTeam(
    @User() user: UserData,
    @Body() dto: CreateTeamDto,
  ): Promise<CommandResult<CreateTeamCommand>> {
    return await this.commandBus.execute(new CreateTeamCommand(user, dto));
  }

  @Put('admin/settings')
  async updateSettings(
    @Body() dto: UpdateSettingsDto,
  ): Promise<CommandResult<UpdateSettingsCommand>> {
    return await this.commandBus.execute(new UpdateSettingsCommand(dto));
  }

  @Put('admin/leave-requests/:leaveRequestId')
  async updateLeaveRequest(
    @User() user: UserData,
    @Param('leaveRequestId') leaveRequestId: string,
    @Body() dto: UpdateLeaveRequestDto,
  ): Promise<CommandResult<UpdateLeaveRequestCommand>> {
    return await this.commandBus.execute(
      new UpdateLeaveRequestCommand({
        leaveRequestId,
        dto,
        userId: user.id,
      }),
    );
  }
}
