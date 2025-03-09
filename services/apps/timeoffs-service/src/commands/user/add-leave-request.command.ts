import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddLeaveRequestDto } from '../../dto/add-leave-request.dto';
import { LeaveRequestEntity } from '../../entities/leave-request.entity';

export class AddLeaveRequestCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly dto: AddLeaveRequestDto,
  ) {}
}

@CommandHandler(AddLeaveRequestCommand)
export class AddLeaveRequestHandler
  implements ICommandHandler<AddLeaveRequestCommand>
{
  constructor(
    @InjectRepository(LeaveRequestEntity)
    private readonly leaveRequestRepository: Repository<LeaveRequestEntity>,
  ) {}

  async execute({ userId, dto }: AddLeaveRequestCommand) {
    const entity = await this.leaveRequestRepository.save({
      startDate: new Date(dto.start),
      endDate: new Date(dto.end),
      teamId: dto.teamId,
      type: dto.type,
      userId,
    });

    return entity.id;
  }
}
