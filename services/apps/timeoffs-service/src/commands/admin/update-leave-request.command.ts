import { BadRequestException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateLeaveRequestDto } from '../../dto/update-leave-request.dto';
import {
  LeaveRequestEntity,
  LeaveStatus,
} from '../../entities/leave-request.entity';

export class UpdateLeaveRequestCommand extends Command<void> {
  constructor(
    public readonly args: {
      leaveRequestId: string;
      dto: UpdateLeaveRequestDto;
      userId: string;
    },
  ) {
    super();
  }
}

@CommandHandler(UpdateLeaveRequestCommand)
export class UpdateLeaveRequestHandler
  implements ICommandHandler<UpdateLeaveRequestCommand>
{
  constructor(
    @InjectRepository(LeaveRequestEntity)
    private readonly leaveRequestRepository: Repository<LeaveRequestEntity>,
  ) {}

  async execute({
    args: { leaveRequestId, dto, userId },
  }: UpdateLeaveRequestCommand) {
    const leaveRequest = await this.leaveRequestRepository.findOneOrFail({
      where: { id: leaveRequestId, team: { representativeId: userId } },
      relations: {
        team: true,
      },
    });
    if (leaveRequest.status !== LeaveStatus.Waiting) {
      throw new BadRequestException(
        'Leave request is not waiting for approval',
      );
    }

    await this.leaveRequestRepository.update(leaveRequest.id, {
      status: dto.status,
      reviewedByRepresentativeId: userId,
    });
  }
}
