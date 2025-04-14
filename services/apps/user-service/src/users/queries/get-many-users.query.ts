import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { UserDataDto } from '../dto/user-data.dto';
import { SupabaseService } from '@app/user-service/common/supabase/supabase.service';
import { ApiException } from '@app/ddd/types/api.exception';
import { UserRole } from '@app/shared';

export class GetManyUsersQuery extends Query<UserDataDto[]> {
  constructor(public readonly ids: string[]) {
    super();
  }
}

@QueryHandler(GetManyUsersQuery)
export class GetManyUsersHandler implements IQueryHandler<GetManyUsersQuery> {
  constructor(private readonly supabaseService: SupabaseService) {}

  async execute(command: GetManyUsersQuery) {
    const supabase = this.supabaseService.getClient();

    if (command.ids.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, users(email)')
      .in('id', command.ids);

    if (error) {
      throw new ApiException(error.message, 500);
    }

    return data.map((profile) => ({
      id: profile.id,
      role: profile.role as UserRole,
      email: profile.users!.email!,
    }));
  }
}
