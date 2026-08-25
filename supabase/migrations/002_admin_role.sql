-- Admin role on profiles + helper for first admin via email list
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer'
  CHECK (role IN ('customer', 'admin'));

CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
