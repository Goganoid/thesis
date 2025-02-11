import { Logger } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { ApiException } from 'src/common/ddd/api.exception';
import { SupabaseService } from 'src/common/supabase/supabase.service';
import { UserRole } from 'src/common/types/user-role.enum';
import { InviteDto } from 'src/users/dto/invite.dto';

export class GetInvitesQuery extends Query<InviteDto[]> {
  constructor(public readonly args: void) {
    super();
  }
}

@QueryHandler(GetInvitesQuery)
export class GetInvitesHandler implements IQueryHandler<GetInvitesQuery> {
  private readonly logger = new Logger(GetInvitesHandler.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async execute() {
    const client = this.supabaseService.getClient();
    const result = await client.from('invites').select();
    if (result.error) {
      this.logger.error('Failed to fetch invites', result.error);
      throw new ApiException('Internal server exception', 500);
    }
    return result.data.map<InviteDto>((row) => ({
      email: row.email,
      role: row.role as UserRole,
      id: row.id,
    }));
  }
}
