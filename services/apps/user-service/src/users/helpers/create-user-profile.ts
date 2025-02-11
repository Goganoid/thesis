import { ApiException } from '@app/user-service/common/ddd/api.exception';
import { Database } from '@app/user-service/common/supabase/database.types';
import { UserRole } from '@app/user-service/common/types/user-role.enum';
import { SupabaseClient } from '@supabase/supabase-js';

export const createUserProfile = async (
  client: SupabaseClient<Database>,
  data: { id: string; role: UserRole; position: string | null },
) => {
  const result = await client.from('profiles').insert([data]);

  if (result.error) {
    throw new ApiException(result.error.message, 500);
  }
  return result.data;
};
