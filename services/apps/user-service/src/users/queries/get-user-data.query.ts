import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { UserDataDto } from '../dto/user-data.dto';
import { SupabaseService } from '@app/user-service/common/supabase/supabase.service';
import { NotFoundException } from '@nestjs/common';
import { UserRole } from '@app/shared';

export class GetUserDataQuery extends Query<UserDataDto> {
  constructor(public readonly jwt: string) {
    super();
  }
}

@QueryHandler(GetUserDataQuery)
export class GetUserDataHandler implements IQueryHandler<GetUserDataQuery> {
  constructor(private readonly supabaseService: SupabaseService) {}

  async execute({ jwt }: GetUserDataQuery) {
    const supabase = this.supabaseService.getClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(jwt);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new NotFoundException('User profile does not exist');
    }

    return {
      id: user.id,
      email: user.email!,
      role: profile.role as UserRole,
    };
  }
}
