import { SupabaseClient } from '@supabase/supabase-js';
import { ApiException } from 'src/common/ddd/api.exception';
import { Database } from 'src/common/supabase/database.types';
import { UserRole } from 'src/common/types/user-role.enum';

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
