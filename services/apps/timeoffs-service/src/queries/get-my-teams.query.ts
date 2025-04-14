import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { MyTeamsDto } from '../dto/my-teams.dto';
import { TeamEntity } from '../entities/team.entity';
import { UserClient } from '../grpc/user-client.service';
import { uniq } from 'lodash';
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
    private readonly userClient: UserClient,
  ) {}

  async execute(query: GetMyTeamsQuery) {
    const teams = await this.teamRepository.find({
      where: [
        {
          memberIds: Raw((alias) => {
            const table = alias.split('.')[0];
            return `"${table}".member_ids::jsonb @> '["${query.userId}"]'`;
          }),
        },
        { representativeId: query.userId },
      ],
    });

    const members = await this.userClient.findMany(
      uniq(teams.flatMap((team) => team.memberIds)),
    );

    return {
      teams: teams.map((team) => ({
        id: team.id,
        name: team.name,
        representativeId: team.representativeId,
        members: team.memberIds.map((memberId) => ({
          id: memberId,
          name:
            members.find((member) => member.id === memberId)?.email ||
            'unknown',
        })),
      })),
    };
  }
}
