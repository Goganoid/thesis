import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { SupabaseService } from '@app/user-service/common/supabase/supabase.service';
import { ApiException } from '@app/ddd/types/api.exception';
import { UserDataDto } from '../dto/user-data.dto';
import { UserRole } from '@app/shared';

export class GetAllUsersQuery extends Query<UserDataDto[]> {
  constructor() {
    super();
  }
}

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler implements IQueryHandler<GetAllUsersQuery> {
  constructor(private readonly supabaseService: SupabaseService) {}

  async execute(command: GetAllUsersQuery) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, users(email)');
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
