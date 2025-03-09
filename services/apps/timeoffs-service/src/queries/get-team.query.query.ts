import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamDto } from '../dto/team.dto';
import { TeamEntity } from '../entities/team.entity';

export class GetTeamQuery extends Query<TeamDto> {
  constructor(public readonly args: { teamId: string }) {
    super();
  }
}

@QueryHandler(GetTeamQuery)
export class GetTeamHandler implements IQueryHandler<GetTeamQuery> {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teamRepository: Repository<TeamEntity>,
  ) {}

  async execute(query: GetTeamQuery) {
    const team = await this.teamRepository.findOneByOrFail({
      id: query.args.teamId,
    });

    // TODO: fetch members from user-service

    return {
      id: team.id,
      name: team.name,
      representativeId: team.representativeId,
      members: team.memberIds.map((memberId) => ({
        id: memberId,
        name: memberId, // Note: You might want to fetch actual user names from a user service
      })),
    };
  }
}
