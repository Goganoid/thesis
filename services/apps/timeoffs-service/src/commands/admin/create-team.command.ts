import { UserData } from '@app/auth';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamEntity } from '../../entities/team.entity';
import { UserRole } from '@app/shared';
import { ForbiddenException } from '@nestjs/common';
import { CreateTeamDto } from '../../dto/create-team.dto';

export class CreateTeamCommand implements ICommand {
  constructor(
    public readonly user: UserData,
    public readonly dto: CreateTeamDto,
  ) {}
}

@CommandHandler(CreateTeamCommand)
export class CreateTeamHandler implements ICommandHandler<CreateTeamCommand> {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teamRepository: Repository<TeamEntity>,
  ) {}

  async execute({ dto, user }: CreateTeamCommand) {
    if (user.role !== UserRole.Manager && user.role !== UserRole.Admin) {
      throw new ForbiddenException();
    }

    const team = await this.teamRepository.save({
      name: dto.name,
      representativeId: dto.representativeId,
    });

    return team.id;
  }
}
