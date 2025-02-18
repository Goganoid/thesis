import { ApiException } from '@app/ddd/types/api.exception';
import { UserRole } from '@app/shared';
import { Database } from '@app/user-service/common/supabase/database.types';
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
