import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TeamLeaveRequestsDto } from '../dto/team-leave-requests.dto';
import { LeaveRequestEntity } from '../entities/leave-request.entity';
import { TeamEntity } from '../entities/team.entity';
import { LeaveRequestDto } from '../dto/leave-request.dto';
import { UserClient } from '../grpc/user-client.service';
import { uniq } from 'lodash';

export class GetTeamLeaveRequestsQuery extends Query<TeamLeaveRequestsDto> {
  constructor(public readonly args: { teamId: string; userId: string }) {
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
    private readonly userClient: UserClient,
  ) {}

  async execute({ args: { teamId, userId } }: GetTeamLeaveRequestsQuery) {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    if (!team.memberIds.includes(userId) && userId !== team.representativeId) {
      throw new ForbiddenException(
        `User with ID ${userId} is not a member of team with ID ${teamId}`,
      );
    }

    const leaveRequests = await this.leaveRequestRepository.find({
      where: {
        userId: In(team.memberIds),
        teamId,
      },
    });

    const members = await this.userClient.findMany(
      uniq(leaveRequests.map((r) => r.userId)),
    );

    return {
      teamId: team.id,
      name: team.name,
      leaveRequests: leaveRequests.map<LeaveRequestDto>((r) => ({
        id: r.id,
        userId: r.userId,
        name: members.find((m) => m.id === r.userId)?.email || 'unknown',
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
