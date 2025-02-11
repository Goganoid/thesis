CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  position text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE invites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL
);