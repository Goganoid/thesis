ALTER TABLE profiles
ADD COLUMN public_user_id uuid REFERENCES users(id);

UPDATE profiles
SET public_user_id = (SELECT id FROM users WHERE users.id = profiles.id);

