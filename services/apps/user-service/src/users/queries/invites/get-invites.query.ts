import { Logger } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { ApiException } from '@app/ddd/types/api.exception';
import { InviteDto } from '../../dto/invite.dto';
import { SupabaseService } from '@app/user-service/common/supabase/supabase.service';
import { UserRole } from '@app/shared';
import { UserData } from '@app/auth/user.type';

export class GetInvitesQuery extends Query<InviteDto[]> {
  constructor(public readonly args: { user: UserData }) {
    super();
  }
}

@QueryHandler(GetInvitesQuery)
export class GetInvitesHandler implements IQueryHandler<GetInvitesQuery> {
  private readonly logger = new Logger(GetInvitesHandler.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async execute({ args: { user } }: GetInvitesQuery) {
    if (user.role === UserRole.User) {
      throw new ApiException('No access', 401);
    }
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
