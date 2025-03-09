import { UserData } from '@app/auth';
import { UserRole } from '@app/shared';
import { ForbiddenException } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddToTeamDto } from '../../dto/add-to-team.dto';
import { TeamEntity } from '../../entities/team.entity';
import { uniq } from 'lodash';

export class AddToTeamCommand implements ICommand {
  constructor(
    public readonly user: UserData,
    public readonly teamId: string,
    public readonly dto: AddToTeamDto,
  ) {}
}

@CommandHandler(AddToTeamCommand)
export class AddToTeamHandler implements ICommandHandler<AddToTeamCommand> {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teamRepository: Repository<TeamEntity>,
  ) {}

  async execute({ user, dto, teamId }: AddToTeamCommand) {
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
