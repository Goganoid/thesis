CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text
);

-- Insert existing users from auth.users
INSERT INTO public.users (id, email)
SELECT id, email
FROM auth.users;


create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_new_user
after insert on auth.users for each row
execute procedure public.handle_new_user ();

