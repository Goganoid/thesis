import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { MyTeamsDto } from '../dto/my-teams.dto';
import { TeamEntity } from '../entities/team.entity';

export class GetMyTeamsQuery extends Query<MyTeamsDto> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetMyTeamsQuery)
export class GetMyTeamsQueryHandler implements IQueryHandler<GetMyTeamsQuery> {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teamRepository: Repository<TeamEntity>,
  ) {}

  async execute(query: GetMyTeamsQuery) {
    const teams = await this.teamRepository.find({
      where: [
        { memberIds: Raw((alias) => `${alias}::jsonb @> '[${query.userId}]'`) },
        { representativeId: query.userId },
      ],
    });

    return {
      teams: teams.map((team) => ({
        id: team.id,
        name: team.name,
      })),
    };
  }
}
