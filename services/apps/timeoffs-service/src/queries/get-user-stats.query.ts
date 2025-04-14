import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStatsDto } from '../dto/user-stats.dto';
import {
  LeaveRequestEntity,
  LeaveStatus,
  LeaveType,
} from '../entities/leave-request.entity';
import { SettingsEntity } from '../entities/settings.entity';

export class GetUserStatsQuery extends Query<UserStatsDto> {
  constructor(
    public readonly userId: string,
    public readonly teamId: string,
  ) {
    super();
  }
}

@QueryHandler(GetUserStatsQuery)
export class GetUserStatsHandler implements IQueryHandler<GetUserStatsQuery> {
  constructor(
    @InjectRepository(LeaveRequestEntity)
    private readonly leaveRequestRepository: Repository<LeaveRequestEntity>,
    @InjectRepository(SettingsEntity)
    private readonly settingsRepository: Repository<SettingsEntity>,
  ) {}

  async execute({ userId, teamId }: GetUserStatsQuery): Promise<UserStatsDto> {
    const settings = await this.settingsRepository.findOneOrFail({
      where: { id: 'primary' },
    });

    const approvedLeaveDays = await this.leaveRequestRepository.find({
      where: {
        userId,
        status: LeaveStatus.Approved,
        teamId,
      },
    });

    return {
      sickDays: {
        total: settings.maxSickDays,
        used: approvedLeaveDays.filter((l) => l.type === LeaveType.SickLeave)
          .length,
      },
      timeoffDays: {
        total: settings.maxVacationDays,
        used: approvedLeaveDays.filter((l) => l.type === LeaveType.TimeOff)
          .length,
      },
    };
  }
}
