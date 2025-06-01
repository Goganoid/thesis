import { UserData } from '@app/auth';
import { getYearFilter } from '@app/shared/typeorm/getYearFilter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddLeaveRequestDto } from '../../dto/add-leave-request.dto';
import {
  LeaveRequestEntity,
  LeaveStatus,
  LeaveType,
} from '../../entities/leave-request.entity';
import { SettingsEntity } from '../../entities/settings.entity';
import { TeamEntity } from '../../entities/team.entity';

export class AddLeaveRequestCommand extends Command<string> {
  constructor(
    public readonly user: UserData,
    public readonly teamId: string,
    public readonly dto: AddLeaveRequestDto,
  ) {
    super();
  }
}

@CommandHandler(AddLeaveRequestCommand)
export class AddLeaveRequestHandler
  implements ICommandHandler<AddLeaveRequestCommand>
{
  constructor(
    @InjectRepository(LeaveRequestEntity)
    private readonly leaveRequestRepository: Repository<LeaveRequestEntity>,
    @InjectRepository(TeamEntity)
    private readonly teamRepository: Repository<TeamEntity>,
    @InjectRepository(SettingsEntity)
    private readonly settingsRepository: Repository<SettingsEntity>,
  ) {}

  async execute({ user, teamId, dto }: AddLeaveRequestCommand) {
    const team = await this.teamRepository.findOne({
      where: {
        id: teamId,
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with id ${teamId} not found`);
    }

    const settings = await this.settingsRepository.findOneOrFail({
      where: { id: 'primary' },
    });

    const approvedLeaveDays = await this.leaveRequestRepository.find({
      where: {
        userId: user.id,
        status: LeaveStatus.Approved,
        startDate: getYearFilter(new Date().getFullYear()),
      },
    });

    const sickLeavesTotal = approvedLeaveDays.filter(
      (l) => l.type === LeaveType.SickLeave,
    ).length;
    const timeoffLeavesTotal = approvedLeaveDays.filter(
      (l) => l.type === LeaveType.TimeOff,
    ).length;

    const isExceeded =
      dto.type === LeaveType.SickLeave
        ? sickLeavesTotal >= settings.maxSickDays
        : timeoffLeavesTotal >= settings.maxVacationDays;

    if (isExceeded) {
      throw new BadRequestException('Max leave days per year exceeded');
    }

    const isRepresentative = team.representativeId === user.id;

    const entity = await this.leaveRequestRepository.save({
      startDate: new Date(dto.start),
      endDate: new Date(dto.end),
      teamId,
      type: dto.type,
      userId: user.id,
      ...(isRepresentative
        ? {
            status: LeaveStatus.Approved,
            reviewedByRepresentativeId: user.id,
          }
        : {
            status: LeaveStatus.Waiting,
          }),
    });

    return entity.id;
  }
}
