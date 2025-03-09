import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TeamLeaveRequestsDto } from '../dto/team-leave-requests.dto';
import { LeaveRequestEntity } from '../entities/leave-request.entity';
import { TeamEntity } from '../entities/team.entity';
import { LeaveRequestDto } from '../dto/leave-request.dto';

export class GetTeamLeaveRequestsQuery extends Query<TeamLeaveRequestsDto> {
  constructor(public readonly args: { teamId: string }) {
    super();
  }
}

@QueryHandler(GetTeamLeaveRequestsQuery)
export class GetTeamLeaveRequestsHandler
  implements IQueryHandler<GetTeamLeaveRequestsQuery>
{
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teamRepository: Repository<TeamEntity>,
    @InjectRepository(LeaveRequestEntity)
    private readonly leaveRequestRepository: Repository<LeaveRequestEntity>,
  ) {}

  async execute({ args: { teamId } }: GetTeamLeaveRequestsQuery) {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    const leaveRequests = await this.leaveRequestRepository.find({
      where: {
        userId: In(team.memberIds),
      },
    });

    return {
      teamId: team.id,
      leaveRequests: leaveRequests.map<LeaveRequestDto>((r) => ({
        id: r.id,
        userId: r.userId,
        startDate: r.startDate,
        endDate: r.endDate,
        status: r.status,
        type: r.type,
        reviewedByRepresentativeId: r.reviewedByRepresentativeId,
        teamId: r.teamId,
      })),
    };
  }
}
