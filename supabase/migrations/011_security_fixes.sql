-- Security hardening: orders, invoices, place_order RPC, profiles INSERT, published products

-- 1. Lock down place_order RPC to service role only
REVOKE ALL ON FUNCTION public.place_order FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order TO service_role;

-- 2. Remove public read on order_events and invoices
DROP POLICY IF EXISTS "Anyone can read order events" ON order_events;
DROP POLICY IF EXISTS "Anyone can read invoices" ON invoices;

-- Order owners may read their own timeline events
CREATE POLICY "Users read own order events" ON order_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_events.order_id
        AND o.user_id = auth.uid()
    )
  );

-- Invoices: no public/anon read — admin app uses service role only

-- 3. Profile INSERT: force customer role unless service role
CREATE OR REPLACE FUNCTION public.protect_profiles_role_insert()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.jwt() ->> 'role', '') <> 'service_role' THEN
    NEW.role := 'customer';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profiles_role_insert ON public.profiles;
CREATE TRIGGER protect_profiles_role_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profiles_role_insert();

-- 4. Only published products visible to public
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read published products" ON products
  FOR SELECT USING (status = 'published');
