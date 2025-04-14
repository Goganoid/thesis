import { UserData } from '@app/auth';
import { UserRole } from '@app/shared';
import { ForbiddenException } from '@nestjs/common';
import { CommandHandler, Command, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateTeamDto } from '../../dto/update-team.dto';
import { TeamEntity } from '../../entities/team.entity';
import { uniq } from 'lodash';

export class UpdateTeamCommand extends Command<void> {
  constructor(
    public readonly user: UserData,
    public readonly teamId: string,
    public readonly dto: UpdateTeamDto,
  ) {
    super();
  }
}

@CommandHandler(UpdateTeamCommand)
export class UpdateTeamHandler implements ICommandHandler<UpdateTeamCommand> {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teamRepository: Repository<TeamEntity>,
  ) {}

  async execute({ user, dto, teamId }: UpdateTeamCommand) {
    if (user.role !== UserRole.Manager && user.role !== UserRole.Admin) {
      throw new ForbiddenException();
    }

    const team = await this.teamRepository.findOneOrFail({
      where: { id: teamId },
    });

    team.memberIds = uniq([...team.memberIds, ...dto.members]);

    await this.teamRepository.update(team.id, { memberIds: team.memberIds });
  }
}
