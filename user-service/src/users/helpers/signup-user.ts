import { SupabaseClient } from '@supabase/supabase-js';
import { ApiException } from 'src/common/ddd/api.exception';

export const signUpUser = async (
  supabase: SupabaseClient,
  email: string,
  password: string,
) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw new ApiException(authError.message, 500);
  }

  if (!authData.user) {
    throw new ApiException('Registration failed', 500);
  }
  return authData.user;
};
