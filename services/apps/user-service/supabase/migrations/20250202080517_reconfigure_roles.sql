create or replace function public.rbac_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
  declare
    claims jsonb;
    user_role text;
  begin
    select role into user_role from public.profiles where id = (event->>'user_id')::uuid;

    claims := event->'claims';

    
    if user_role is not null then
      claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    else
      claims := jsonb_set(claims, '{user_role}', 'null');
    end if;

    event := jsonb_set(event, '{claims}', claims);

    return event;
  end;
$$;

grant usage on schema public to supabase_auth_admin;
grant usage on schema public to service_role;

grant execute
  on function public.rbac_access_token_hook
  to supabase_auth_admin;

revoke execute
  on function public.rbac_access_token_hook
  from authenticated, anon, public;

grant all
  on table public.profiles
to supabase_auth_admin;

