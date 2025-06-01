import { ApiException } from '@app/ddd/types/api.exception';
import { UserRole } from '@app/shared';
import { Database } from '@app/user-service/common/supabase/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export const createUserProfile = async (
  client: SupabaseClient<Database>,
  data: { id: string; role: UserRole; position: string | null; public_user_id: string },
) => {
  const result = await client.from('profiles').insert([
    {
      id: data.id,
      role: data.role,
      position: data.position,
      public_user_id: data.public_user_id,
    },
  ]);

  if (result.error) {
    throw new ApiException(result.error.message, 500);
  }
  return result.data;
};
