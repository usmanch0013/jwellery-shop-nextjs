-- Fix address RLS for INSERT and grant admin role to store owner

DROP POLICY IF EXISTS "Users manage own addresses" ON addresses;

CREATE POLICY "Users read own addresses" ON addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own addresses" ON addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own addresses" ON addresses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own addresses" ON addresses
  FOR DELETE USING (auth.uid() = user_id);

UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE lower(email) = 'asantechpvt@gmail.com'
);
